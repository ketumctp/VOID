import * as rpc from '../../rpc';
import * as keyring from '../../keyring';
import { KNOWN_PROGRAMS } from '../../../shared/constants';

export const riskService = {
    async performRiskAssessment(parsedData: any, rawTransaction?: string) {
        const publicKey = await keyring.getPublicKey();
        if (!publicKey) return undefined;

        const balanceLamports = await rpc.getBalance(publicKey);
        const balanceSol = balanceLamports / 1_000_000_000;

        // --- SIMULATION (Anti-Drain) ---
        let simulationStatus: 'success' | 'failed' | 'pending' = 'pending';
        let simulationDetails: any = undefined;
        let simulationLogs: string[] = [];
        let innerPrograms: string[] = [];
        let hasCPI = false;  // CPI detected (depth > 1)
        let hasLogDetectedDangerousOp = false; // Detected "Instruction: Approve" etc in logs

        if (rawTransaction) {
            try {
                // Inspect our own account for balance changes
                const simResult = await rpc.simulateTransaction(rawTransaction, [publicKey]);

                simulationStatus = simResult.simulationStatus;
                simulationLogs = simResult.logs || [];

                // PHASE 2: CPI Detection from logs
                const invokePattern = /Program\s+([1-9A-HJ-NP-Za-km-z]{32,44})\s+invoke\s*\[?(\d+)?\]?/g;
                const programInvokes: { programId: string; depth: number }[] = [];

                for (const log of simulationLogs) {
                    let match;
                    while ((match = invokePattern.exec(log)) !== null) {
                        programInvokes.push({
                            programId: match[1],
                            depth: match[2] ? parseInt(match[2]) : 1
                        });
                    }
                }

                // Extract unique program IDs
                innerPrograms = [...new Set(programInvokes.map(p => p.programId))];

                // Check for CPI: depth > 1 means a program called another program
                hasCPI = programInvokes.some(p => p.depth > 1);

                // OPUS LAYER: Detect Dangerous Ops directly from LOGS (Heuristic)
                const dangerousLogPatterns = [
                    /Instruction:\s*Approve/i,
                    /Instruction:\s*SetAuthority/i,
                    /Instruction:\s*CloseAccount/i,
                    /Instruction:\s*Burn/i
                ];

                hasLogDetectedDangerousOp = simulationLogs.some(log =>
                    dangerousLogPatterns.some(pattern => pattern.test(log))
                );

                if (simResult.err) {
                    // HARD BLOCK: Simulation error = FAILED
                    simulationStatus = 'failed';
                    simulationDetails = {
                        preBalance: balanceSol,
                        postBalance: 0,
                        diff: 0,
                        success: false,
                        error: JSON.stringify(simResult.err).substring(0, 100)
                    };
                } else if (simResult.accounts && simResult.accounts[0]) {
                    const postBalanceLamports = simResult.accounts[0].lamports;
                    const diffLamports = postBalanceLamports - balanceLamports;
                    const diffSol = diffLamports / 1_000_000_000;

                    simulationDetails = {
                        preBalance: balanceSol,
                        postBalance: postBalanceLamports / 1_000_000_000,
                        diff: diffSol,
                        success: true
                    };

                    // PRODUCTION RULE: Logs empty but balance changed = FAILED
                    if (simulationLogs.length === 0 && diffSol !== 0) {
                        simulationStatus = 'failed';
                    }
                }
            } catch (e) {
                console.warn('Simulation crashed:', e);
                // ALL errors = FAILED
                simulationStatus = 'failed';
            }
        } else {
            // No raw transaction = cannot simulate = FAILED
            simulationStatus = 'failed';
        }

        // PHASE 1: If simulation failed, DO NOT HARD BLOCK (Devnet/RPC issues)
        if (simulationStatus === 'failed') {
            return {
                level: 'CRITICAL',
                message: 'SIMULATION FAILED: Unable to verify transaction safety. Proceed with extreme caution.',
                simulation: simulationDetails,
                simulationStatus: 'failed',
                simulationLogs,
                innerPrograms,
                hardBlocked: false,
                requireConfirmText: true
            };
        }


        let totalTransferSol = 0;
        let hasCriticalTokenTransfer = false;
        let tokenTransferDetails = '';

        let hasSetAuthority = false;
        let hasBurn = false;
        let hasApprove = false;
        let hasUnknownProgram = false;
        let unknownProgramId = '';

        // Strict Program Check
        if (parsedData && parsedData.instructions) {
            const KNOWN_PROGRAM_IDS = Object.values(KNOWN_PROGRAMS);

            parsedData.instructions.forEach((ix: any) => {
                // Program Check
                if (ix.parsed && ix.parsed.programId) {
                    if (!KNOWN_PROGRAM_IDS.includes(ix.parsed.programId)) {
                        hasUnknownProgram = true;
                        unknownProgramId = ix.parsed.programId;
                    }
                } else if (ix.programId) {
                    // Check raw program ID if not parsed
                    if (!KNOWN_PROGRAM_IDS.includes(ix.programId)) {
                        hasUnknownProgram = true;
                        unknownProgramId = ix.programId;
                    }
                }

                if (ix.parsed?.type === 'transfer' && ix.parsed.info?.tokenProgram !== 'spl' && ix.parsed.info?.amount) {
                    totalTransferSol += Number(ix.parsed.info.amount);
                }
                else if (ix.parsed?.tokenProgram === 'spl') {
                    const info = ix.parsed.info;
                    if (ix.parsed.type === 'approve') {
                        hasApprove = true;
                    } else if (info.amountRaw && info.amountRaw !== '0') {
                        hasCriticalTokenTransfer = true;
                        tokenTransferDetails = `Token Transfer Detected! Amount: ${info.amount || info.amountRaw}`;
                    }
                }
                else if (ix.parsed?.type === 'setAuthority') hasSetAuthority = true;
                else if (ix.parsed?.type === 'burn' || ix.parsed?.type === 'closeAccount') hasBurn = true;
            });
        }

        // Priority 2: Unknown Program (ALWAYS CRITICAL - NO DOWNGRADE)
        if (hasUnknownProgram) {
            return {
                level: 'CRITICAL',
                message: `UNVERIFIED PROGRAM: Interacting with unknown contract (${unknownProgramId.substring(0, 8)}...). You must type the FULL Program ID to proceed.`,
                simulation: simulationDetails,
                simulationStatus,
                simulationLogs,
                innerPrograms,
                isUnknownProgram: true,
                unknownProgramId,
                requireProgramIdInput: true
            };
        }

        // RULE 1: CPI indicators + balance change = HARD BLOCK
        if ((hasCPI || innerPrograms.length >= 1) && simulationDetails?.diff && simulationDetails.diff !== 0) {
            return {
                level: 'CRITICAL',
                message: `⛔ CPI RISK BLOCKED: ${innerPrograms.length} program(s) with balance change of ${simulationDetails.diff.toFixed(6)} RIALO. Log-based detection - verify manually if needed.`,
                simulation: simulationDetails,
                simulationStatus,
                simulationLogs,
                innerPrograms,
                hardBlocked: true
            };
        }

        // RULE 2: CPI + dangerous ops = HARD BLOCK
        if ((hasCPI || innerPrograms.length > 1) && (hasApprove || hasSetAuthority || hasLogDetectedDangerousOp)) {
            return {
                level: 'CRITICAL',
                message: `⛔ CPI + DANGEROUS OP BLOCKED: Detected suspicion instruction (Approve/SetAuthority/etc) via CPI logs or parsing. Hard blocked for safety.`,
                simulation: simulationDetails,
                simulationStatus,
                simulationLogs,
                innerPrograms,
                hardBlocked: true
            };
        }

        // Priority 3: Static Analysis High Risk
        if (hasSetAuthority) return { level: 'CRITICAL', message: '☠️ DANGEROUS OPERATION: "Set Authority" detected.', simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms, requireConfirmText: true };
        if (hasApprove) return { level: 'CRITICAL', message: '☠️ DANGEROUS OPERATION: "Approve Delegate" detected.', simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms, requireConfirmText: true };
        if (hasBurn) return { level: 'CRITICAL', message: '🔥 DANGEROUS OPERATION: "Burn" or "CloseAccount" detected.', simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms, requireConfirmText: true };
        if (hasCriticalTokenTransfer) return { level: 'CRITICAL', message: `TOKEN DRAIN RISK: ${tokenTransferDetails}`, simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms, requireConfirmText: true };

        if (totalTransferSol > 0) {
            if (totalTransferSol >= balanceSol * 0.9) {
                return { level: 'CRITICAL', message: `DRAIN RISK: Transferring ${Math.round((totalTransferSol / balanceSol) * 100)}% of balance!`, simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms, requireConfirmText: true };
            } else if (totalTransferSol > 10) {
                return { level: 'HIGH', message: `High Value Transaction: ${totalTransferSol} SOL`, simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms };
            } else if (totalTransferSol > 1) {
                return { level: 'MEDIUM', message: `Transfer: ${totalTransferSol} SOL`, simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms };
            }
        }

        return { level: 'LOW', message: 'Transaction Simulated', simulation: simulationDetails, simulationStatus, simulationLogs, innerPrograms };
    }
};
