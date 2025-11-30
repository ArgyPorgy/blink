/**
 * In-memory storage for tip configurations.
 * In production, this would be replaced with a database.
 */

export interface TipConfig {
  tipId: string;
  creatorAddress: string;
  defaultAmount: string; // USDC amount as string
  createdAt: number;
}

const tipStorage = new Map<string, TipConfig>();

/**
 * Create a new tip configuration
 */
export function createTipConfig(
  creatorAddress: string,
  defaultAmount: string
): TipConfig {
  const tipId = generateTipId();
  const config: TipConfig = {
    tipId,
    creatorAddress,
    defaultAmount,
    createdAt: Date.now(),
  };
  tipStorage.set(tipId, config);
  return config;
}

/**
 * Get a tip configuration by tipId
 */
export function getTipConfig(tipId: string): TipConfig | undefined {
  return tipStorage.get(tipId);
}

/**
 * Generate a unique tip ID
 */
function generateTipId(): string {
  return `tip_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}


