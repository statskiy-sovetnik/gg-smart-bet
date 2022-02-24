export function calculateCoefFromPercent(team_win_percent: number): number {
  const probability = team_win_percent / 100;
  const coefRaw = 1 / probability;
  return Number(coefRaw.toFixed(2));
}
