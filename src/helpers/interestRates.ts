export const SECONDS_PER_YEAR = BigInt(60 * 60 * 24 * 365);

type PerSecondRateAtArgs = {
  utilization: bigint;
  kink: bigint;
  base: bigint;
  slopeLow: bigint;
  slopeHigh: bigint;
  factorScale: bigint;
};

export function perSecondRateAt({
  utilization,
  kink,
  base,
  slopeLow,
  slopeHigh,
  factorScale
}: PerSecondRateAtArgs): bigint {
  if (utilization <= kink) {
    return base + (slopeLow * utilization) / factorScale;
  }
  return base + (slopeLow * kink) / factorScale + (slopeHigh * (utilization - kink)) / factorScale;
}
