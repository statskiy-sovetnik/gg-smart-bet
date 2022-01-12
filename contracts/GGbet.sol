pragma solidity >=0.4.22 <0.9.0;


struct SportsEvent {
  uint8 id;
  string team_1_name;
  string team_2_name;
  string team_1_logo;
  string team_2_logo;
  uint8 team_1_win_percent;
  uint8 team_2_win_percent;
}


contract GGbet {
  address public owner = msg.sender;

  SportsEvent[] private sports_events_set;

  SportsEvent public current_sports_event;
  bool public sports_event_in_progress = false;

  constructor() {
    initializeSportsEvents();
  }

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
      string memory team_1_logo,
      string memory team_2_logo,
      uint8 team_1_win_percent,
      uint8 team_2_win_percent
    ) = getSportsEventById(_id);

    current_sports_event = SportsEvent({
      id: id,
      team_1_name: team_1_name,
      team_2_name: team_2_name,
      team_1_logo: team_1_logo,
      team_2_logo: team_2_logo,
      team_1_win_percent: team_1_win_percent,
      team_2_win_percent: team_2_win_percent
    });
    sports_event_in_progress = true;
  }

  function initializeSportsEvents() private {
    sports_events_set.push(getLfcVsBarcaEvent());
    sports_events_set.push(getBayernVsMancityEvent());
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
      string memory team_1_logo,
      string memory team_2_logo,
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
          temp.team_1_logo,
          temp.team_2_logo,
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
      team_1_logo: '//storage.mds.yandex.net/get-sport/10493/a1f72d2597a2184052676f7a8cbcd58c.png',
      team_2_logo: '//storage.mds.yandex.net/get-sport/69603/9288c960498f253e15610e40d731e71f.png',
      team_1_win_percent: 65,
      team_2_win_percent: 10
    });
  }

  function getBayernVsMancityEvent() private pure returns (SportsEvent memory) {
    return SportsEvent({
      id: 1,
      team_1_name : 'FC Bayern',
      team_2_name : 'FC Manchester City',
      team_1_logo: '//storage.mds.yandex.net/get-sport/67389/dabd286313551986e4f9e794f501b72e.png',
      team_2_logo: '//storage.mds.yandex.net/get-sport/67389/66e93ce4d1eb16643864f3f311d3ef83.png',
      team_1_win_percent: 25,
      team_2_win_percent: 35
    });
  }
}
