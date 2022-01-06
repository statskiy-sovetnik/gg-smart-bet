pragma solidity >=0.4.22 <0.9.0;

struct Team {
  string name;
}

struct Match {
  Team team_1;
  Team team_2;
}

struct SportsEvent {
  uint8 id;
  Match match_data;
  uint8 team_1_win_percent;
  uint8 team_2_win_percent;
}

contract GGbet {
  address public owner = msg.sender;

  Match[] private matches_set; // storage, obviously - it is shared between function calls and transactions
  SportsEvent[] private sports_events_set;

  SportsEvent public current_event;

  modifier restricted() {
    require(
      msg.sender == owner,
      "This function is restricted to the contract's owner"
    );
    _;
  }

  /*
    PUBLIC functions
  */

  function setCurrentEventById(uint8 _id) restricted public {
    current_event = getSportsEventById(_id);
  }

  function setPredefinedSportsEvents() public restricted {
    setPredefinedMatches();

    uint matches_count = matches_set.length;

    for (uint i = 0; i < matches_count; i++) {
      uint8 id = uint8(i);
      SportsEvent memory _event = generateEventFromMatch(matches_set[i], id);
      sports_events_set.push(_event);
    }
  }

  function getSportsEventsSet() public view restricted returns (SportsEvent[] memory) {
    return sports_events_set;
  }

  /*
    PRIVATE functions
  */

  function getSportsEventById(uint8 _id) private view returns (SportsEvent memory) {
    uint events_num = sports_events_set.length;

    for(uint i = 0; i < events_num; i++) {
      if (_id == sports_events_set[i].id) {
        return sports_events_set[i];
      }
    }

    revert("There is no event with this id");
  }

  function setPredefinedMatches() private {
    Match memory lfc_vs_barca = getLfcVsBarcaMatch();
    Match memory bayern_vs_mancity = getBayernVsMancityMatch();
    matches_set.push(lfc_vs_barca);
    matches_set.push(bayern_vs_mancity);
  }

  function generateEventFromMatch(Match memory _match, uint8 _id) private pure returns (SportsEvent memory) {
    return SportsEvent({
      id: _id,
      match_data: _match,
      team_1_win_percent: 65,
      team_2_win_percent: 10
    });
  }

  function getLfcVsBarcaMatch() private pure returns (Match memory) {
    return Match({
      team_1 : getLiverpoolTeam(),
      team_2 : getBarcelonaTeam()
    });
  }

  function getBayernVsMancityMatch() private pure returns (Match memory) {
    return Match({
      team_1 : getBayernTeam(),
      team_2 : getMancityTeam()
    });
  }

  function getLiverpoolTeam() private pure returns (Team memory) {
    return Team({
      name : 'FC Liverpool'
    });
  }

  function getBarcelonaTeam() private pure returns (Team memory) {
    return Team({
      name : 'FC Barcelona'
    });
  }

  function getBayernTeam() private pure returns (Team memory) {
    return Team({
      name : 'FC Bayern'
    });
  }

  function getMancityTeam() private pure returns (Team memory) {
    return Team({
      name : 'FC Manchester City'
    });
  }
}
