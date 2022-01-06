const GGbet = artifacts.require('GGbet');

require('chai').use(require('chai-as-promised')).should();

contract('GGbet', ([owner, user_1]) => {
  let gg_bet;

  before(async () => {
    gg_bet = await GGbet.new();
  });

  describe('Checking initial contract state', async () => {
    it('Sports events initialized', async () => {
      // initializing sports events
      await gg_bet.setPredefinedSportsEvents({from: owner});
      const sports_events = await gg_bet.getSportsEventsSet({from: owner});

      assert.isAbove(
        sports_events.length,
        0,
        'sports events set must not be empty'
      );
    });
  });
});
