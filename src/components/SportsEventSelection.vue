<template>
  <div class="container">
    <h2 class="title">No sports events are taking place right now</h2>
    <button v-if="user.isOwnerOfGGbet" class="button">Start event</button>
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import User from '@/types/User';
  import SportsEvent from '@/types/SportsEvent';
  import {Contract} from 'web3-eth-contract';

  @Options({
    props: {
      user: {
        type: User,
        required: true,
      },

      gg_bet_contract: {
        type: Contract,
        required: true,
      },
    },
  })
  export default class SportsEventSelection extends Vue {
    user!: User;
    gg_bet_contract: Contract | null = null;

    sports_events_count = 0;
    sports_events_set: SportsEvent[] = [];

    async created() {
      if (this.user.isOwnerOfGGbet) {
        await this.checkSportsEventsSet();
        await this.updateSportsEventsSet();
      }
    }

    async updateSportsEventsSet() {
      await this.updateSportsEventsCount();

      for (let i = 0; i < this.sports_events_count; i++) {
        const e = await this.getSportsEventById(i);
        this.sports_events_set.push(e);
      }
    }

    async updateSportsEventsCount() {
      this.sports_events_count = await this.gg_bet_contract?.methods
        .getSportsEventsCount()
        .call();
    }

    async getSportsEventById(id: number) {
      return await this.gg_bet_contract?.methods.getSportsEventById(id).call();
    }

    async checkSportsEventsSet() {
      const sports_events_set_initialized =
        await this.getSportsEventsInitFlag();

      if (!sports_events_set_initialized) {
        await this.initializeGGbetSportsEvents();
      }
    }

    async initializeGGbetSportsEvents() {
      await this.gg_bet_contract?.methods.initializeSportsEvents().send({
        from: this.user.account,
      });
    }

    async getSportsEventsInitFlag() {
      return await this.gg_bet_contract?.methods
        .sports_events_set_initialized()
        .call();
    }
  }
</script>

<style lang="scss" scoped>
  @import '../vars';

  .title {
    font-size: 40px;
    color: $blueActive;
  }
</style>
