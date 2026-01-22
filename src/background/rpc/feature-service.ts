import { isFeatureActive } from '../../shared/rialo-core';

/**
 * Get Feature Status
 */
export async function getFeatureStatus(featureId: string): Promise<boolean | null> {
    // Check client-side registry first
    if (isFeatureActive(featureId)) return true;

    // Optionally check logic on chain if needed, but for MVP we use registry
    // Return null implies 'unknown' or 'inactive' depending on interpretation
    return false;
}
