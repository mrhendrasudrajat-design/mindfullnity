export function activePhaseIndex(
  phaseCount: number,
  elapsedSeconds: number,
  totalSeconds: number,
): number {
  if (phaseCount <= 0) return 0
  if (totalSeconds <= 0) return 0
  const ratio = Math.min(1, Math.max(0, elapsedSeconds / totalSeconds))
  return Math.min(phaseCount - 1, Math.floor(ratio * phaseCount))
}

export function ringProgress(elapsedSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0
  return Math.min(1, Math.max(0, 1 - elapsedSeconds / totalSeconds))
}
