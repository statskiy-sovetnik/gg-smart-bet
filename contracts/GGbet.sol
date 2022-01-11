pragma solidity >=0.4.22 <0.9.0;


struct SportsEvent {
  uint8 id;
  string team_1_name;
  string team_2_name;
  uint8 team_1_win_percent;
  uint8 team_2_win_percent;
}


contract GGbet {
  address public owner = msg.sender;

  SportsEvent[] private sports_events_set;
  bool public sports_events_set_initialized = false;

  SportsEvent public current_sports_event;
  bool public sports_event_in_progress = false;

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

  function setCurrentSportsEventById(uint8 _id) public restricted {
    (
      uint8 id,
      string memory team_1_name,
      string memory team_2_name,
      uint8 team_1_win_percent,
      uint8 team_2_win_percent
    ) = getSportsEventById(_id);

    current_sports_event = SportsEvent({
      id: id,
      team_1_name: team_1_name,
      team_2_name: team_2_name,
      team_1_win_percent: team_1_win_percent,
      team_2_win_percent: team_2_win_percent
    });
    sports_event_in_progress = true;
  }

  function initializeSportsEvents() public restricted {
    sports_events_set.push(getLfcVsBarcaEvent());
    sports_events_set.push(getBayernVsMancityEvent());

    sports_events_set_initialized = true;
  }

  function getSportsEventsCount() public view restricted returns (uint) {
    return sports_events_set.length;
  }

  function getSportsEventById(uint8 _id)
    public
    view
    restricted
    returns (
      uint8 id,
      string memory team_1_name,
      string memory team_2_name,
      uint8 team_1_win_percent,
      uint8 team_2_win_percent
    )
  {
    for(uint i = 0; i < sports_events_set.length; i++) {
      if (_id == sports_events_set[i].id) {
        SportsEvent storage temp = sports_events_set[i]; // reference, no copy. just for brevity

        return (
          temp.id,
          temp.team_1_name,
          temp.team_2_name,
          temp.team_1_win_percent,
          temp.team_2_win_percent
        );
      }
    }

    revert("There is no event with this id");
  }

  /*
    PRIVATE functions
  */

  function getLfcVsBarcaEvent() private pure returns (SportsEvent memory) {
    return SportsEvent({
      id: 0,
      team_1_name : 'FC Liverpool',
      team_2_name : 'FC Barcelona',
      team_1_win_percent: 65,
      team_2_win_percent: 10
    });
  }

  function getBayernVsMancityEvent() private pure returns (SportsEvent memory) {
    return SportsEvent({
      id: 1,
      team_1_name : 'FC Bayern',
      team_2_name : 'FC Manchester City',
      team_1_win_percent: 25,
      team_2_win_percent: 35
    });
  }
}
