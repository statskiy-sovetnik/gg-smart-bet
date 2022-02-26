<template>
  <div v-if="user.isOwnerOfGGbet" class="container">
    <h4 class="close-event-title">Close current sports event</h4>
    <button
      class="close-event-btn button"
      @click="handleCloseEventBtnClick('team_1', team_1_win_coef)"
    >
      {{ sports_event.team_1_name }} wins
    </button>
    <button
      class="close-event-btn button"
      @click="handleCloseEventBtnClick('draw', draw_coef)"
    >
      Draw
    </button>
    <button
      class="close-event-btn button"
      @click="handleCloseEventBtnClick('team_2', team_2_win_coef)"
    >
      {{ sports_event.team_2_name }} wins
    </button>
  </div>
</template>
<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import { calculateCoefFromPercent } from '@/utils/calculateCoefFromPercent';
  import { calculateDrawCoef } from '@/utils/calculateDrawCoef';
  import SportsEvent from '@/types/SportsEvent';
  import { Contract } from 'web3-eth-contract';
  import User from '@/types/User';

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
  export default class CloseEventSection extends Vue {
    sports_event: SportsEvent | null = null;
    user!: User;
    gg_bet_contract!: Contract;

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

    async handleCloseEventBtnClick(outcome: string, coef: number) {
      this.emitClosingSportsEventStart();
      await this.closeCurrentSportsEvent(outcome, coef);
    }

    async closeCurrentSportsEvent(outcome: string, coef: number) {
      const coef_integer_part = Math.trunc(coef);
      const coef_decimal_part = this.getCoefDecimalPartNormalized(coef);

      try {
        await this.gg_bet_contract?.methods
          .endCurrentSportsEvent(outcome, coef_integer_part, coef_decimal_part)
          .send({ from: this.user.account });
      } catch (e) {
        this.emitClosingSportsEventCancel();
      }
    }

    getCoefDecimalPartNormalized(coef: number): number {
      const decimal = Number((coef % 1).toFixed(2));
      return decimal ? decimal * 100 : decimal;
    }

    emitClosingSportsEventStart() {
      this.$emit('closingSportsEventStarted');
    }

    emitClosingSportsEventCancel() {
      this.$emit('closingSportsEventCancelled');
    }
  }
</script>
<style lang="scss" scoped>
  @import './src/vars.scss';

  .close-event-title {
    color: #fff;
    font-size: 18px;
    text-transform: uppercase;
    font-style: italic;
  }

  .close-event-btn {
    margin-right: 15px;
  }
</style>
