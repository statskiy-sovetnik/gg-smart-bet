<template>
  <div class="control-panel">
    <h5 class="control-title">Make your bet</h5>

    <p class="control-description">
      Enter the amount of Wei that you willing to bet and select the outcome of
      the match if you are smart enough
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
        <span class="control-button-text _coef">x{{ team_1_win_coef }}</span>
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
        <span class="control-button-text _coef">x{{ team_2_win_coef }}</span>
      </button>
    </div>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import SportsEvent from '@/types/SportsEvent';
  import { getConnectedWeb3Instance } from '@/utils/getConnectedWeb3Instance';
  import { BigNumber } from 'bignumber.js';
  import { Contract } from 'web3-eth-contract';
  import { calculateCoefFromPercent } from '@/utils/calculateCoefFromPercent';
  import { calculateDrawCoef } from '@/utils/calculateDrawCoef';

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
    },
  })
  export default class ControlPanel extends Vue {
    sports_event: SportsEvent | null = null;
    bet_amount_is_correct = true;
    gg_bet_contract!: Contract;
    amount_in_wei: number = 0;
    min_bet_in_wei: BigNumber = new BigNumber(0);

    get team_1_win_coef(): number {
      const percent = Number(this.sports_event?.team_1_win_percent);
      return calculateCoefFromPercent(percent);
    }

    get draw_coef(): number {
      const t1 = this.sports_event?.team_1_win_percent || 0;
      const t2 = this.sports_event?.team_2_win_percent || 0;
      return calculateDrawCoef(t1, t2);
    }

    get team_2_win_coef(): number {
      const percent = Number(this.sports_event?.team_2_win_percent);
      return calculateCoefFromPercent(percent);
    }

    get min_bet_in_eth(): string {
      //@ts-ignore
      const min_bet_BN = web3.utils.toBN(this.min_bet_in_wei); // BigNumber instance to BN
      return web3.utils.fromWei(min_bet_BN);
    }

    async created() {
      await this.updateMinBetInWei();
    }

    async updateMinBetInWei() {
      this.min_bet_in_wei = await this.gg_bet_contract?.methods
        .min_bet()
        .call();
    }

    handleAmountInput(): void {
      const formatted = this.amount_in_wei.toString().replace(/[^0-9]/g, '');
      this.amount_in_wei = Number(formatted);
    }

    handleControlBtnClick(outcome: string) {
      this.validateAmountInput();

      if (this.bet_amount_is_correct) {
        this.$emit('betRequest', outcome, this.amount_in_wei);
      }
    }

    validateAmountInput(): void {
      this.bet_amount_is_correct = true;
      this.validateAmountInputByMinValue();
    }

    validateAmountInputByMinValue(): void {
      const amount_value_bn = new BigNumber(this.amount_in_wei);

      if (amount_value_bn.isLessThan(this.min_bet_in_wei)) {
        alert('Minimal bet is ' + this.min_bet_in_eth + ' ether');
        this.bet_amount_is_correct = false;
      }
    }
  }
</script>
<style lang="scss" scoped>
  @import '../vars';

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
</style>
