import Match from '@/types/Match';

type SportsEvent = {
  id: number;
  match: Match;
  team_1_win_percent: number;
  team_2_win_percent: number;
};

export default SportsEvent;
