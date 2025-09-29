// currency.ts - Utility functions for currency conversion and minimums
// Placeholder for Aptos: calculateAptosAmount based on NGN to APT exchange rate (mock 3500 NGN/APT)
// In production, use API (e.g., Pyth or oracle) for real rate
// MINIMUM_OCTAS: Minimum 0.1 APT (10_000_000 octas) for gas/reliability

export const APTOS_NGN_RATE = 3500; // Mock rate: 1 APT = 3500 NGN; update with real (e.g., via API)

export const calculateAptosAmount = (ngnAmount: number): number => {
  return ngnAmount / APTOS_NGN_RATE; // Returns APT amount from NGN
};

export const MINIMUM_OCTAS = '0.1'; // Minimum 0.1 APT in whole APT for calculation
