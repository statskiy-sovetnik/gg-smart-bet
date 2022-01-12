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
        <!--  A Block with buttons for betting -->
        <div class="control-panel">
          <h5 class="control-title">Match result</h5>
          <div class="control-buttons-block">
            <button class="control-button button _pink">
              <span class="control-button-text _content"
                >{{ sports_event.team_1_name }} wins</span
              >
              <span class="control-button-text _coef">x{{ team1WinCoef }}</span>
            </button>
            <button class="control-button button _pink">
              <span class="control-button-text _content">Draw</span>
              <span class="control-button-text _coef">x{{ drawCoef }}</span>
            </button>
            <button class="control-button button _pink">
              <span class="control-button-text _content"
                >{{ sports_event.team_2_name }} wins</span
              >
              <span class="control-button-text _coef">x{{ team2WinCoef }}</span>
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

  @Options({
    props: {
      sports_event: {
        type: SportsEvent,
        required: true,
      },
    },
  })
  export default class SportsEventExtended extends Vue {
    sports_event!: SportsEvent;

    get team1WinCoef(): number {
      const percent = Number(this.sports_event.team_1_win_percent);
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    get drawCoef(): number {
      const percent = Number(
        100 -
          this.sports_event.team_1_win_percent -
          this.sports_event.team_2_win_percent
      );
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    get team2WinCoef(): number {
      const percent = Number(this.sports_event.team_2_win_percent);
      const coefRaw = this.calculateCoefFromPercent(percent);
      return Number(coefRaw.toFixed(2));
    }

    calculateCoefFromPercent(percent: number): number {
      const probability = percent / 100;
      return 1 / probability;
    }
  }
</script>

<style lang="scss" scoped>
  @import '../vars';

  .box {
    height: 450px;
    border-bottom: 1px solid #000;
    background-color: $dark;

    .content-container {
      height: 100%;
    }

    .content-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .teams-data {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      align-items: center;
    }

    .team-wrapper {
      display: flex;
      align-items: center;
    }

    .team-name {
      color: #fff;
      font-size: 45px;
      line-height: 1.3;
      margin: 0 20px;
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
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .control-title {
      color: #fff;
      font-size: 14px;
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
  }
</style>
