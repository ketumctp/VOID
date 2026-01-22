
import { Buffer } from 'buffer';

import { RialoAddress } from '../shared/chain-compat';

export interface ParsedInstruction {
    programId: string;
    programName: string;
    data: string; // Base64 or decoded details
    accounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
    parsed?: {
        type: 'transfer' | 'unknown';
        to: string;
        amount: string; // Formatted SOL string
    };
}

export interface ParsedTransaction {
    feePayer: string;
    validFrom: string; // Hex or date string
    instructions: ParsedInstruction[];
    raw: string;
}

export function parseTransaction(base64Tx: string): ParsedTransaction | null {
    try {
        const buffer = Buffer.from(base64Tx, 'base64');
        let offset = 0;

        // 1. Signatures
        const numSignatures = readCompactU16(buffer, offset);
        offset = numSignatures.newOffset;

        // Skip signatures (64 bytes each)
        offset += numSignatures.value * 64;

        // Message Start
        // 2. Header
        const numRequiredSignatures = buffer[offset]; // Needed for signer check logic
        offset += 3;

        // 3. Accounts
        const numAccounts = readCompactU16(buffer, offset);
        offset = numAccounts.newOffset;

        const accounts: string[] = [];
        for (let i = 0; i < numAccounts.value; i++) {
            const pubkey = new RialoAddress(buffer.slice(offset, offset + 32));
            accounts.push(pubkey.toBase58());
            offset += 32;
        }

        // 4. Valid From (8 bytes)
        const validFromHex = buffer.slice(offset, offset + 8).toString('hex');
        offset += 8;

        // 5. Instructions
        const numInstructions = readCompactU16(buffer, offset);
        offset = numInstructions.newOffset;

        const instructions: ParsedInstruction[] = [];

        for (let i = 0; i < numInstructions.value; i++) {
            // Program Index
            const progIdx = buffer[offset];
            offset += 1;
            const programId = accounts[progIdx];

            // Account Indices
            const numIxAccounts = readCompactU16(buffer, offset);
            offset = numIxAccounts.newOffset;

            const ixAccounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[] = [];
            for (let j = 0; j < numIxAccounts.value; j++) {
                const accIdx = buffer[offset];
                offset += 1;

                ixAccounts.push({
                    pubkey: accounts[accIdx],
                    isSigner: accIdx < numRequiredSignatures.valueOf(),
                    isWritable: true // simplified
                });
            }

            // Data
            const dataLen = readCompactU16(buffer, offset);
            offset = dataLen.newOffset;
            const data = buffer.slice(offset, offset + dataLen.value);
            offset += dataLen.value;

            // Attempt to parse instruction
            let parsedInfo: any = undefined;
            let programName = 'Unknown Program';

            // System Program ID: 11111111111111111111111111111111
            if (programId === '11111111111111111111111111111111') {
                programName = 'System Program';
                // Transfer is usually index 2, checking simple layout
                // 4 bytes instruction index (2 = transfer), 8 bytes lamports
                if (data.length === 12) {
                    const typeIdx = data.readUInt32LE(0);
                    if (typeIdx === 2) {
                        const amountLanports = data.readBigUInt64LE(4);

                        // Format BigInt to Decimal String (Safely)
                        const whole = amountLanports / 1_000_000_000n;
                        const fraction = amountLanports % 1_000_000_000n;
                        const amountStr = `${whole}.${fraction.toString().padStart(9, '0').replace(/0+$/, '')}`;
                        const finalAmount = amountStr.replace(/\.$/, '.0');

                        parsedInfo = {
                            type: 'transfer',
                            info: {
                                from: ixAccounts[0]?.pubkey,
                                to: ixAccounts[1]?.pubkey,
                                amount: finalAmount
                            }
                        };
                    }
                }
            }
            // SPL Token Program ID: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
            // SPL Token-2022 Program ID: TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
            else if (
                programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' ||
                programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
            ) {
                programName = programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
                    ? 'Token-2022 Program'
                    : 'Token Program';

                // Parse Instruction Type
                if (data.length > 0) {
                    const typeIdx = data[0]; // 1 byte for SPL Token Instruction usually

                    // Transfer (3)
                    if (typeIdx === 3 && data.length === 9) {
                        const amountRaw = data.readBigUInt64LE(1);
                        parsedInfo = {
                            type: 'transfer',
                            info: {
                                from: ixAccounts[0]?.pubkey, // Source Account
                                to: ixAccounts[1]?.pubkey,   // Destination
                                amountRaw: amountRaw.toString(),
                                tokenProgram: programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'token-2022' : 'spl'
                            }
                        };
                    }
                    // Approve (4)
                    else if (typeIdx === 4 && data.length === 9) {
                        const amountRaw = data.readBigUInt64LE(1);
                        parsedInfo = {
                            type: 'approve',
                            info: {
                                source: ixAccounts[0]?.pubkey,
                                delegate: ixAccounts[1]?.pubkey,
                                amountRaw: amountRaw.toString(),
                                tokenProgram: programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'token-2022' : 'spl'
                            }
                        };
                    }
                    // SetAuthority (6)
                    else if (typeIdx === 6) {
                        // Layout: [1 byte type] [1 byte authorityType] [1 byte option] [32 bytes newAuthority (optional)]
                        const authorityTypes = ['MintTokens', 'FreezeAccount', 'AccountOwner', 'CloseAccount'];
                        const authTypeIdx = data[1];
                        const authorityType = authorityTypes[authTypeIdx] || 'Unknown';

                        let newAuthority = 'None (Revoked)';
                        if (data[2] === 1 && data.length >= 35) {
                            const authBytes = data.slice(3, 35);
                            newAuthority = new RialoAddress(authBytes).toBase58();
                        }

                        parsedInfo = {
                            type: 'setAuthority',
                            info: {
                                account: ixAccounts[0]?.pubkey,
                                currentAuthority: ixAccounts[1]?.pubkey,
                                authorityType,
                                newAuthority,
                                tokenProgram: programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'token-2022' : 'spl'
                            }
                        };
                    }
                    // Burn (8)
                    else if (typeIdx === 8 && data.length === 9) {
                        const amountRaw = data.readBigUInt64LE(1);
                        parsedInfo = {
                            type: 'burn',
                            info: {
                                account: ixAccounts[0]?.pubkey,
                                mint: ixAccounts[1]?.pubkey,
                                authority: ixAccounts[2]?.pubkey,
                                amountRaw: amountRaw.toString(),
                                tokenProgram: programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'token-2022' : 'spl'
                            }
                        };
                    }
                    // TransferChecked (12)
                    // Layout: [1 byte type] [8 bytes amount] [1 byte decimals]
                    else if (typeIdx === 12 && data.length === 10) {
                        const amountRaw = data.readBigUInt64LE(1);
                        const decimals = data[9];

                        // Format amount with decimals
                        let amountStr = amountRaw.toString();
                        if (decimals > 0) {
                            const divisor = BigInt(10) ** BigInt(decimals);
                            const whole = amountRaw / divisor;
                            const fraction = amountRaw % divisor;
                            amountStr = `${whole}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '')}`;
                            amountStr = amountStr.replace(/\.$/, '.0');
                        }

                        parsedInfo = {
                            type: 'transferChecked',
                            info: {
                                from: ixAccounts[0]?.pubkey,
                                mint: ixAccounts[1]?.pubkey,
                                to: ixAccounts[2]?.pubkey,
                                amount: amountStr,
                                decimals: decimals,
                                tokenProgram: programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'token-2022' : 'spl'
                            }
                        };
                    }
                }
            }

            // Fallback for Unknown Parsing
            if (!parsedInfo) {
                // Provide a partial parsed info for UI to show "Raw Data" properly
                // Hex dump the data for better visibility
                parsedInfo = {
                    type: 'unknown',
                    info: {
                        dataHex: data.toString('hex'),
                        programId: programId
                    }
                };
            }

            instructions.push({
                programId,
                programName,
                data: data.toString('base64'),
                accounts: ixAccounts,
                parsed: parsedInfo
            });
        }

        return {
            feePayer: accounts[0], // Usually first account is fee payer
            validFrom: validFromHex,
            instructions,
            raw: base64Tx
        };

    } catch (e) {
        console.error('Failed to parse transaction:', e);
        return null;
    }
}

function readCompactU16(buffer: Buffer, offset: number): { value: number, newOffset: number } {
    let len = 0;
    let size = 0;
    let shift = 0;

    while (true) {
        if (offset + len >= buffer.length) {
            throw new Error('Transaction parsing error: Unexpected end of buffer (CompactU16)');
        }

        const byte = buffer[offset + len];
        len++;
        size |= (byte & 0x7f) << shift;

        if ((byte & 0x80) === 0) {
            break;
        }

        shift += 7;
        // CompactU16 shouldn't need more than 3 bytes (encodes up to 16383 which fits in 2 bytes usually, but spec allows up to 3 bytes for 16 bit values technically if inefficiently encoded, or if used for larger types. U16 max is 65535, which needs 3 bytes: 1111 111 1111111 (7+7+2 = 16 bits))
        // 3 bytes can carry 21 bits.
        if (shift > 14 && (byte & 0x80) !== 0) {
            throw new Error('Transaction parsing error: CompactU16 too long');
        }
    }

    return { value: size, newOffset: offset + len };
}
