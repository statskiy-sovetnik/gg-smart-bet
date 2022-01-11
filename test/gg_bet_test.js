const GGbet = artifacts.require('GGbet');

require('chai').use(require('chai-as-promised')).should();

contract('GGbet', ([owner, user_1]) => {
  let gg_bet;

  before(async () => {
    gg_bet = await GGbet.new();
  });

  describe('Checking initial contract state', async () => {
    it('Sports events set is empty', async () => {
      const flag = await gg_bet.sports_events_set_initialized();
      assert.equal(flag, false, 'flag should be false');
    });

    it('Sports events initialized', async () => {
      // initializing sports events
      await gg_bet.initializeSportsEvents({from: owner});
      const sports_events_count = await gg_bet.getSportsEventsCount({
        from: owner,
      });

      assert.isAbove(
        Number(sports_events_count),
        0,
        'sports events set must not be empty'
      );
    });

    it('Sports events flag is updated', async () => {
      const flag = await gg_bet.sports_events_set_initialized();
      assert.equal(flag, true, 'flag should be true');
    });
  });

  describe('Selecting a Sports Event', async () => {
    it('No active sports event', async () => {
      const in_progress = await gg_bet.sports_event_in_progress();
      assert.equal(
        in_progress,
        false,
        'there must not be active sports events initially'
      );
    });

    it('Sports event with correct id successfully selected', async () => {
      const event_id = 1;
      await gg_bet.setCurrentSportsEventById(event_id, {from: owner});

      //checking data
      const current_sports_event = await gg_bet.current_sports_event();
      assert.equal(current_sports_event.id, event_id, 'incorrect event id');
    });

    it('Sports event is taking place', async () => {
      const in_progress = await gg_bet.sports_event_in_progress();
      assert.equal(
        in_progress,
        true,
        'flag is not set after starting an event'
      );
    });

    it('Transaction with incorrect id is reverted', async () => {
      await gg_bet.setCurrentSportsEventById(1000, {from: owner}).should.be
        .rejected;
    });

    it('Method access rights are correct', async () => {
      await gg_bet.setCurrentSportsEventById(0, {from: user_1}).should.be
        .rejected;
    });
  });
});
