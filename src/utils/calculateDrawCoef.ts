import { calculateCoefFromPercent } from '@/utils/calculateCoefFromPercent';

export function calculateDrawCoef(
  team_1_win_percent: number,
  team_2_win_percent: number
): number {
  const percent = Number(100 - team_1_win_percent - team_2_win_percent);
  return calculateCoefFromPercent(percent);
}
