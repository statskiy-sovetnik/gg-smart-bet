<template>
  <div class="sports-event-option">
    <div class="data-block">
      <span class="team-name">{{ sports_event.team_1_name }}</span>
      <span class="team-divider">-</span>
      <span class="team-name">{{ sports_event.team_2_name }}</span>
    </div>

    <button class="button _small" @click="emitBtnClick">Start</button>
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import SportsEvent from '@/types/SportsEvent';

  @Options({
    props: {
      sports_event: {
        type: SportsEvent,
        required: true,
      },
    },
  })
  export default class SportsEventOption extends Vue {
    sports_event!: SportsEvent;

    emitBtnClick() {
      this.$emit('sportsEventSelect', this.sports_event.id);
    }
  }
</script>

<style lang="scss" scoped>
  @import '../vars';

  .sports-event-option {
    display: flex;
    justify-content: space-between;
    background-color: $dark;
    color: #fff;
    width: 100%;
    max-width: 800px;
    padding: 32px;
    border-radius: 16px;
    margin-bottom: 20px;
  }

  .data-block {
    display: flex;
    align-items: center;
    margin-right: 60px;
  }

  .team-name {
    font-size: 24px;
    line-height: 1.3;
  }

  .team-divider {
    font-size: 50px;
    margin: 0 40px;
  }
</style>
