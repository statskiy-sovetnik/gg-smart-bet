<template>
  <div class="container">
    <h2 class="title">No sports events are taking place right now</h2>

    <div v-if="user.isOwnerOfGGbet">
      <SportsEventOption
        v-for="sports_event in sports_events_set"
        :key="sports_event.id"
        :sports_event="sports_event"
        @sportsEventSelect="emitSportsEventSelect"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import User from '@/types/User';
  import SportsEvent from '@/types/SportsEvent';
  import {Contract} from 'web3-eth-contract';
  import SportsEventOption from '@/components/SportsEventOption.vue';

  @Options({
    components: {SportsEventOption},

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

    emitSportsEventSelect(id: string) {
      this.$emit('sportsEventSelect', id);
    }
  }
</script>

<style lang="scss" scoped>
  @import '../vars';

  .title {
    font-size: 40px;
    color: $blueActive;
    margin-bottom: 50px;
  }
</style>
