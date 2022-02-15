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

        <div v-if="user_bet_is_accepted" class="user-bet-info-block">
          <p class="user-bet">
            Your bet is {{ user_bet_data?.bet }} Wei <br />
            on {{ outcome_label }}
          </p>
        </div>
        <!-- Display bet pending    -->
        <div v-else-if="do_display_pending_bet" class="bet-pending-text">
          Your bet is pending...
        </div>

        <ControlPanel
          v-else
          :gg_bet_contract="gg_bet_contract"
          :sports_event="sports_event"
          @betRequest="handleBetRequest"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Options, Vue } from 'vue-class-component';
  import SportsEvent from '@/types/SportsEvent';
  import { Contract } from 'web3-eth-contract';
  import User from '@/types/User';
  import { EventData } from 'web3-eth-contract/types';
  import { Transaction } from 'web3-eth/types';
  import { PromiEvent } from 'web3-core';
  import { getConnectedWeb3Instance } from '@/utils/getConnectedWeb3Instance';
  import { getCookie } from '@/utils/getCookie';
  import { setCookie } from '@/utils/setCookie';
  import { Subscription } from 'web3-core-subscriptions';
  import { eraseCookie } from '@/utils/eraseCookie';
  import ControlPanel from '@/components/ControlPanel.vue';

  const web3 = getConnectedWeb3Instance();

  // TO-DO: убрать тесты (логи и проверки)

  @Options({
    components: { ControlPanel },
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

    watch: {
      pending_txs_event(event_obj) {
        if (event_obj !== null) {
          this.saveUserPendingTxHashToCookies();
          this.bet_is_pending = true;
        }
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
    pending_txs_event: Subscription<String> | null = null;
    bet_log: EventData | null = null;
    bet_tx_cookie_name = 'bet_tx_hash';
    bet_is_pending = Boolean(this.getBetPendingTxHashCookie());

    get user_bet_is_accepted(): boolean {
      return this.user_bet_data ? this.user_bet_data.bet !== '0' : false;
    }

    get do_display_pending_bet(): boolean {
      return this.bet_is_pending && !this.user_bet_is_accepted;
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

      if (!this.user_bet_is_accepted) {
        this.subscribeOnBetAcceptance();
      }
    }

    async updateUserBetData() {
      const data = await this.gg_bet_contract?.methods
        .getUserBet()
        .call({ from: this.user.account });

      this.user_bet_data = {
        bet: data.bet,
        outcome: data.outcome,
      };
    }

    handleBetRequest(outcome: string, amount_in_wei: number) {
      this.performBetWithTrack(outcome, amount_in_wei);
    }

    performBetWithTrack(outcome: string, amount_in_wei: number) {
      this.subscribeOnPendingTxs();
      this.bet(outcome, amount_in_wei)
        ?.on('transactionHash', () => {
          this.subscribeOnBetAcceptance();
        })
        .on('error', (error: Error) => {
          this.handleBetCancel(error);
        });
    }

    subscribeOnPendingTxs() {
      this.pending_txs_event = web3.eth.subscribe('pendingTransactions');
    }

    unsubscribeOnPendingTxs() {
      this.pending_txs_event?.unsubscribe();
    }

    bet(outcome: string, amount_in_wei: number): PromiEvent<any> | undefined {
      let t;

      if (outcome === 'team_1') {
        t = this._betOnTeam1(amount_in_wei);
      } else if (outcome === 'draw') {
        t = this._betOnDraw(amount_in_wei);
      } else if (outcome === 'team_2') {
        t = this._betOnTeam2(amount_in_wei);
      }

      return t;
    }

    _betOnTeam1(amount_in_wei: number): PromiEvent<any> {
      return this.gg_bet_contract?.methods.betOnTeam1().send({
        from: this.user.account,
        value: amount_in_wei,
      });
    }

    _betOnDraw(amount_in_wei: number): PromiEvent<any> {
      return this.gg_bet_contract?.methods.betOnDraw().send({
        from: this.user.account,
        value: amount_in_wei,
      });
    }

    _betOnTeam2(amount_in_wei: number): PromiEvent<any> {
      return this.gg_bet_contract?.methods.betOnTeam2().send({
        from: this.user.account,
        value: amount_in_wei,
      });
    }

    saveUserPendingTxHashToCookies() {
      //@ts-ignore
      this.pending_txs_event?.on('data', async (tx_hash: string) => {
        const tx: Transaction = await web3.eth.getTransaction(tx_hash);
        if (this.isTxFromUserToGGbet(tx)) {
          setCookie(this.bet_tx_cookie_name, tx_hash);
        }
      });
    }

    handleBetCancel(error: Error) {
      this.bet_is_pending = false;
      this.pending_txs_event?.unsubscribe();
      console.log(error);
    }

    subscribeOnBetAcceptance() {
      // add filter by user address
      const _this = this;
      const options = {
        filter: {
          _address: this.user.account,
        },
      };

      this.gg_bet_contract?.once(
        // здесь нужно проверить что нужный адрес
        'BetAccepted',
        options,
        (error, event: EventData) => {
          if (!error) {
            _this.handleBetAcceptanceEvent(event);
          }
        }
      );
    }

    handleBetAcceptanceEvent(event: EventData) {
      this.bet_log = event;
      eraseCookie(this.bet_tx_cookie_name);
      this.unsubscribeOnPendingTxs();
      this.bet_is_pending = false;
      this.updateUserBetData();
    }

    getBetPendingTxHashCookie(): string | undefined {
      return getCookie(this.bet_tx_cookie_name);
    }

    isTxFromUserToGGbet(tx: Transaction) {
      return (
        tx.from === this.user.account &&
        tx.to === this.gg_bet_contract.options.address
      );
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

    .bet-pending-text {
      color: $pinkActive;
      font-size: 24px;
      font-weight: bold;
      font-style: italic;
      text-transform: uppercase;
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
