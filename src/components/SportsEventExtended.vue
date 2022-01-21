<template>
  <div class="box">
    <div class="container content-container">
      <div class="content-wrapper">
        <div class="teams-data">
          <div class="team-wrapper">
            <span class="team-name">{{ sports_event.team_1_name }}</span>
            <img
              :src="sports_event.team_1_logo"
              alt="Team 1 Logo"
              class="team-logo"
            />
          </div>

          <span class="team-divider">-</span>

          <div class="team-wrapper">
            <img
              :src="sports_event.team_2_logo"
              alt="Team 2 Logo"
              class="team-logo"
            />
            <span class="team-name">{{ sports_event.team_2_name }}</span>
          </div>
        </div>

        <div v-if="user_has_made_bets" class="user-bet-info-block">
          <p class="user-bet">
            Your bet is {{ user_bet_data?.bet }} Wei <br />
            on {{ outcome_label }}
          </p>
        </div>
        <!--  A Block with buttons for betting -->
        <div v-else class="control-panel">
          <h5 class="control-title">Make your bet</h5>

          <p class="control-description">
            Enter the amount of Wei that you willing to bet and select the
            outcome of the match if you are smart enough
          </p>

          <div class="input-block">
            <label class="input-label" for="bet_amount_input"
              >Enter your bet amount</label
            >
            <input
              id="bet_amount_input"
              v-model="amount_in_wei"
              class="input"
              min="0"
              type="number"
              @input="handleAmountInput"
            />
          </div>

          <div class="control-buttons-block">
            <button
              class="control-button button _pink"
              @click="handleControlBtnClick('team_1')"
            >
              <span class="control-button-text _content"
                >{{ sports_event.team_1_name }} wins</span
              >
              <span class="control-button-text _coef"
                >x{{ team_1_win_coef }}</span
              >
            </button>

            <button
              class="control-button button _pink"
              @click="handleControlBtnClick('draw')"
            >
              <span class="control-button-text _content">Draw</span>
              <span class="control-button-text _coef">x{{ draw_coef }}</span>
            </button>

            <button
              class="control-button button _pink"
              @click="handleControlBtnClick('team_2')"
            >
              <span class="control-button-text _content"
                >{{ sports_event.team_2_name }} wins</span
              >
              <span class="control-button-text _coef"
                >x{{ team_2_win_coef }}</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import SportsEvent from '@/types/SportsEvent';
  import {Contract} from 'web3-eth-contract';
  import {BigNumber} from 'bignumber.js';
  import User from '@/types/User';
  import {getConnectedWeb3Instance} from '@/utils/getConnectedWeb3Instance';

  const web3 = getConnectedWeb3Instance();

  @Options({
    props: {
      sports_event: {
        type: SportsEvent,
        required: true,
      },

      gg_bet_contract: {
        type: Contract,
        required: true,
      },

      user: {
        type: User,
        required: true,
      },
    },
  })
  export default class SportsEventExtended extends Vue {
    sports_event!: SportsEvent;
    gg_bet_contract!: Contract;
    user!: User;
    user_bet_data: {
      bet: string;
      outcome: string;
    } | null = null;
    amount_in_wei: number = 0;
    min_bet_in_wei: BigNumber = new BigNumber(0);
    amount_value_is_correct = true;

    get user_has_made_bets(): boolean {
      return this.user_bet_data?.bet !== '0';
    }

    get team_1_win_coef(): number {
      const percent = Number(this.sports_event.team_1_win_percent);
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    get draw_coef(): number {
      const percent = Number(
        100 -
          this.sports_event.team_1_win_percent -
          this.sports_event.team_2_win_percent
      );
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    get team_2_win_coef(): number {
      const percent = Number(this.sports_event.team_2_win_percent);
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    get min_bet_in_eth(): string {
      //@ts-ignore
      const min_bet_BN = web3.utils.toBN(this.min_bet_in_wei); // BigNumber instance to BN
      return web3.utils.fromWei(min_bet_BN);
    }

    get outcome_label(): string {
      if (this.user_bet_data?.outcome === 'team_1') {
        return this.sports_event.team_1_name;
      } else if (this.user_bet_data?.outcome === 'team_2') {
        return this.sports_event.team_2_name;
      } else {
        return 'draw';
      }
    }

    async created() {
      await this.updateUserBetData();

      if (!this.user_has_made_bets) {
        await this.updateMinBetInWei();
      }
    }

    async updateUserBetData() {
      const data = await this.gg_bet_contract?.methods
        .getUserBet()
        .call({from: this.user.account});

      this.user_bet_data = {
        bet: data.bet,
        outcome: data.outcome,
      };
    }

    async updateMinBetInWei() {
      this.min_bet_in_wei = await this.gg_bet_contract?.methods
        .min_bet()
        .call();
    }

    calculateCoefFromPercent(percent: number): number {
      const probability = percent / 100;
      return 1 / probability;
    }

    handleAmountInput(): void {
      const formatted = this.amount_in_wei.toString().replace(/[^0-9]/g, '');
      this.amount_in_wei = Number(formatted);
    }

    async handleControlBtnClick(outcome: string) {
      this.validateAmountInput();

      if (this.amount_value_is_correct) {
        await this.bet(outcome);
        await this.updateUserBetData();
      }
    }

    validateAmountInput(): void {
      this.amount_value_is_correct = true;
      this.validateAmountInputByMinValue();
    }

    validateAmountInputByMinValue(): void {
      const amount_value_bn = new BigNumber(this.amount_in_wei);

      if (amount_value_bn.isLessThan(this.min_bet_in_wei)) {
        alert('Minimal bet is ' + this.min_bet_in_eth + ' ether');
        this.amount_value_is_correct = false;
      }
    }

    async bet(outcome: string) {
      if (outcome === 'team_1') {
        await this._betOnTeam1();
      } else if (outcome === 'draw') {
        await this._betOnDraw();
      } else if (outcome === 'team_2') {
        await this._betOnTeam2();
      }
    }

    async _betOnTeam1() {
      await this.gg_bet_contract?.methods.betOnTeam1().send({
        from: this.user.account,
        value: this.amount_in_wei,
      });
    }

    async _betOnDraw() {
      await this.gg_bet_contract?.methods.betOnDraw().send({
        from: this.user.account,
        value: this.amount_in_wei,
      });
    }

    async _betOnTeam2() {
      await this.gg_bet_contract?.methods.betOnTeam2().send({
        from: this.user.account,
        value: this.amount_in_wei,
      });
    }
  }
</script>

<style lang="scss" scoped>
  @import '../vars';

  .box {
    border-bottom: 1px solid #000;
    background-color: $dark;

    .content-container {
      height: 100%;
    }

    .content-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .teams-data {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
      padding: 50px 0;
      margin-bottom: 30px;
    }

    .team-wrapper {
      display: flex;
      align-items: center;

      &:first-of-type {
        .team-name {
          text-align: end;
        }
      }
    }

    .team-name {
      color: #fff;
      font-size: 40px;
      line-height: 1.1;
      margin: 0 20px;
      width: 300px;
    }

    .team-logo {
      height: 85px;
    }

    .team-divider {
      margin: 0 30px;
      color: #fff;
      font-size: 75px;
    }

    .control-panel {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      border-top: 1px solid black;
    }

    .control-title {
      font-size: 17px;
      line-height: 1.05;
      text-transform: uppercase;
      font-style: italic;
      color: $pinkActive;
    }

    .control-description {
      font-size: 13px;
      text-align: left;
      color: #fff;
      margin: 0 0 50px;
    }

    .input-block {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
    }

    .input-label {
      margin-right: 20px;
      color: $blueDark;
    }

    .control-buttons-block {
      display: flex;
    }

    .control-button {
      &:not(:last-child) {
        margin-right: 15px;
      }
    }

    .control-button-text {
      &._content {
        margin-right: 35px;
      }
    }

    .user-bet {
      font-size: 23px;
      font-weight: bold;
      color: #fff;
      text-align: center;
      line-height: 1.5;
    }
  }
</style>
