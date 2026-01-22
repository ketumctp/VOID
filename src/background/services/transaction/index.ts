import { executionService } from './execution-service';
import { approvalService } from './approval-service';
import { riskService } from './risk-service';

export const transactionService = {
    ...executionService,
    ...approvalService,
    // Expose helpers if needed, or keep them internal
    performRiskAssessment: riskService.performRiskAssessment.bind(riskService)
};

export * from './types';
