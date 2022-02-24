const GGbet = artifacts.require('GGbet');
const Web3 = require('web3');
const web3 = new Web3('ws://127.0.0.1:8545');
const BN = web3.utils.BN;

require('chai').use(require('chai-as-promised')).should();

contract('GGbet', (accounts) => {
  let gg_bet;
  const min_bet_in_eth = 0.0003;
  const min_bet = web3.utils.toWei(new BN(min_bet_in_eth));

  const owner = accounts[0];
  const user_1 = accounts[1];
  const user_2 = accounts[2];
  const user_3 = accounts[3];
  const user_4 = accounts[4];

  const user_1_bet_amount_eth = 0.4;
  const user_2_bet_amount_eth = 0.9;
  const user_3_bet_amount_eth = 0.8;
  const user_4_bet_amount_eth = 0.3;
  const total_bet_amount_eth =
    user_1_bet_amount_eth +
    user_2_bet_amount_eth +
    user_3_bet_amount_eth +
    user_4_bet_amount_eth;

  before(async () => {
    gg_bet = await GGbet.new();
  });

  describe('Checking initial contract state', async () => {
    it('Sports events initialized', async () => {
      const sports_events_count = await gg_bet.getSportsEventsCount({
        from: owner,
      });

      assert.isAbove(
        Number(sports_events_count),
        0,
        'sports events set must not be empty'
      );
    });
  });

  describe('Betting before sports event has been started', async () => {
    it('User current bet request is rejected', async () => {
      await gg_bet.getUserBet({ from: user_1 }).should.be.rejected;
    });

    it('Bet on team 1 is rejected', async () => {
      await gg_bet.betOnTeam1({ from: user_1, value: min_bet }).should.be
        .rejected;
    });

    it('Bet on team 2 is rejected', async () => {
      await gg_bet.betOnTeam2({ from: user_1, value: min_bet }).should.be
        .rejected;
    });

    it('Bet on draw is rejected', async () => {
      await gg_bet.betOnDraw({ from: user_1, value: min_bet }).should.be
        .rejected;
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
      await gg_bet.setCurrentSportsEventById(event_id, { from: owner });

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
      await gg_bet.setCurrentSportsEventById(1000, { from: owner }).should.be
        .rejected;
    });

    it('Method access rights are correct', async () => {
      await gg_bet.setCurrentSportsEventById(0, { from: user_1 }).should.be
        .rejected;
    });
  });

  describe('User 1 making bets', async () => {
    it("User 1 didn't make bets", async () => {
      const res = await gg_bet.getUserBet({ from: user_1 });
      assert.equal(res.bet, 0, 'User initial bet expected to be 0');
    });

    it('User 1 fails to bet on team 1 (incorrect amount)', async () => {
      const val = web3.utils.toWei('0.00001'); // less than minimal accepted amount
      await gg_bet.betOnTeam1({ from: user_1, value: val }).should.be.rejected;
    });

    it('User 1 successfully bets on team 1', async () => {
      const val = web3.utils.toWei(user_1_bet_amount_eth.toString());
      await gg_bet.betOnTeam1({ from: user_1, value: val });
    });

    it('User 1 bet is registered', async () => {
      const bet_data = await gg_bet.getUserBet({ from: user_1 });
      const val = web3.utils.toWei(user_1_bet_amount_eth.toString());

      assert.equal(bet_data.bet, val, 'stored user bet is incorrect');
      assert.equal(
        bet_data.outcome,
        'team_1',
        'stored user match outcome is incorrect'
      );
    });

    it('User 1 fails to make another bet', async () => {
      const val = web3.utils.toWei(user_1_bet_amount_eth.toString());
      await gg_bet.betOnTeam1({ from: user_1, value: val }).should.be.rejected;
      await gg_bet.betOnTeam2({ from: user_1, value: val }).should.be.rejected;
      await gg_bet.betOnDraw({ from: user_1, value: val }).should.be.rejected;
    });
  });

  describe('User 2 making bets', async () => {
    it("User 2 didn't make bets", async () => {
      const res = await gg_bet.getUserBet({ from: user_2 });
      assert.equal(res.bet, 0, 'User initial bet expected to be 0');
    });

    it('User 2 fails to bet on team 2 (incorrect amount)', async () => {
      const val = web3.utils.toWei('0.00001'); // less than minimal accepted amount
      await gg_bet.betOnTeam2({ from: user_2, value: val }).should.be.rejected;
    });

    it('User 2 successfully bets on team 2', async () => {
      const val = web3.utils.toWei(user_2_bet_amount_eth.toString());
      await gg_bet.betOnTeam2({ from: user_2, value: val });
    });

    it('User 2 bet is registered', async () => {
      const bet_data = await gg_bet.getUserBet({ from: user_2 });
      const val = web3.utils.toWei(user_2_bet_amount_eth.toString());

      assert.equal(bet_data.bet, val, 'stored user bet is incorrect');
      assert.equal(
        bet_data.outcome,
        'team_2',
        'stored user match outcome is incorrect'
      );
    });

    it('User 2 fails to make another bet', async () => {
      const val = web3.utils.toWei(user_2_bet_amount_eth.toString());
      await gg_bet.betOnTeam1({ from: user_2, value: val }).should.be.rejected;
      await gg_bet.betOnTeam2({ from: user_2, value: val }).should.be.rejected;
      await gg_bet.betOnDraw({ from: user_2, value: val }).should.be.rejected;
    });
  });

  describe('User 3 making bets', async () => {
    it("User 3 didn't make any bets", async () => {
      const res = await gg_bet.getUserBet({ from: user_3 });
      assert.equal(res.bet, 0, 'User initial bet expected to be 0');
    });

    it('User 3 fails to bet on draw (incorrect amount)', async () => {
      const val = web3.utils.toWei('0.00001'); // less than minimal accepted amount
      await gg_bet.betOnDraw({ from: user_3, value: val }).should.be.rejected;
    });

    it('User 3 successfully bets on draw', async () => {
      const val = web3.utils.toWei(user_3_bet_amount_eth.toString());
      await gg_bet.betOnDraw({ from: user_3, value: val });
    });

    it('User 3 bet is registered', async () => {
      const bet_data = await gg_bet.getUserBet({ from: user_3 });
      const val = web3.utils.toWei(user_3_bet_amount_eth.toString());

      assert.equal(bet_data.bet, val, 'stored user bet is incorrect');
      assert.equal(
        bet_data.outcome,
        'draw',
        'stored user match outcome is incorrect'
      );
    });

    it('User 3 fails to make another bet', async () => {
      const val = web3.utils.toWei(user_3_bet_amount_eth.toString());
      await gg_bet.betOnTeam1({ from: user_3, value: val }).should.be.rejected;
      await gg_bet.betOnTeam2({ from: user_3, value: val }).should.be.rejected;
      await gg_bet.betOnDraw({ from: user_3, value: val }).should.be.rejected;
    });
  });

  describe('User 4 making bets', async () => {
    it('User 4 successfully bets on team 1', async () => {
      const val = web3.utils.toWei(user_4_bet_amount_eth.toString());
      await gg_bet.betOnTeam1({ from: user_4, value: val });
    });

    it('User 4 bet is registered', async () => {
      const bet_data = await gg_bet.getUserBet({ from: user_4 });
      const val = web3.utils.toWei(user_4_bet_amount_eth.toString());

      assert.equal(bet_data.bet, val, 'stored user bet is incorrect');
      assert.equal(
        bet_data.outcome,
        'team_1',
        'stored user match outcome is incorrect'
      );
    });
  });

  describe('Check contract total balance', async () => {
    it('Smart contract balance is correct', async () => {
      const balance = await web3.eth.getBalance(gg_bet.address);
      const total_bet_amount_wei = web3.utils.toWei(
        total_bet_amount_eth.toString()
      );
      assert.equal(
        total_bet_amount_wei,
        balance,
        'The balance of GGbet should be equal to total bet amount'
      );
    });
  });

  describe('Closing current event and sending rewards', async () => {
    it('Only the owner can close current event', async () => {
      await gg_bet.endCurrentSportsEvent('team_1', 1, 20, { from: user_2 })
        .should.be.rejected;
    });

    it('Reject on incorrect outcome', async () => {
      await gg_bet.endCurrentSportsEvent('team', 1, 20, { from: owner }).should
        .be.rejected;
    });

    it('Current event succesfully closed with Team 1 win', async () => {
      await gg_bet.endCurrentSportsEvent('team_1', 1, 30, { from: owner });
      const flag = await gg_bet.sports_event_in_progress();
      assert.equal(flag, false, 'Sports event flag must be false');
    });
  });

  describe('Withdrawing ether from the contract', async () => {
    it('Making sure withdraw function is restricted', async () => {
      await gg_bet.withdraw(1000000, { from: user_1 }).should.be.rejected;
    });
    it('Calling withdraw function', async () => {
      await gg_bet.withdraw(1000000, { from: owner });
    });
  });
});
