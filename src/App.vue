<template>
  <div class="gg-root">
    <Loading v-if="loading" />
    <template v-else>
      <page-header />
    </template>
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import HelloWorld from './components/HelloWorld.vue';
  import PageHeader from '@/components/PageHeader.vue';
  import Loading from '@/components/Loading.vue';
  import Web3 from 'web3';
  import {getConnectedWeb3Instance} from '@/utils/getConnectedWeb3Instance';
  import {User} from '@/types/User';
  import {fetchGGbetAbi} from '@/utils/fetchGGbetAbi';
  import {Contract} from 'web3-eth-contract';
  import SportsEvent from '@/types/SportsEvent';

  @Options({
    components: {
      PageHeader,
      HelloWorld,
      Loading,
    },
  })
  export default class App extends Vue {
    web3: Web3 = new Web3();

    loading = true;

    user: User = {
      account: '',
      balanceInWei: '',
      isOwnerOfGGbet: false,
    };
    accounts: string[] = [];

    gg_bet_contract_address = '0x9a809F814cbEf67bA042C133819c2F11c3612934';
    gg_bet_contract: Contract | null = null;
    sports_event_in_progress = false;
    sports_event: SportsEvent | null = null;
    private gg_bet_contract_owner = '';

    async created() {
      this.loading = true;

      this.initWeb3();
      await this.initGGbetContract();

      await this.updateUserData();
      await this.updateSportsEvent();

      this.loading = false;
    }

    initWeb3() {
      this.web3 = getConnectedWeb3Instance();
    }

    async initGGbetContract() {
      const abi = await fetchGGbetAbi();
      this.gg_bet_contract = new this.web3.eth.Contract(
        abi,
        this.gg_bet_contract_address
      );
    }

    async updateUserData() {
      await this.updateUserAccountData();
      await this.updateUserBalance();
      await this.updateUserOwnership();
    }

    async updateUserAccountData() {
      this.accounts = await this.web3.eth.getAccounts();
      this.user.account = this.accounts[0];
    }

    async updateUserBalance() {
      this.user.balanceInWei = await this.web3.eth.getBalance(
        this.user.account
      );
    }

    async updateUserOwnership() {
      await this.updateGGbetContractOwner();
      this.user.isOwnerOfGGbet =
        this.gg_bet_contract_owner === this.user.account;
    }

    async updateGGbetContractOwner() {
      this.gg_bet_contract_owner = await this.gg_bet_contract?.methods
        .owner()
        .call();
    }

    async updateSportsEvent() {
      await this.updateSportsEventProgressFlag();

      if (this.sports_event_in_progress) {
        this.sports_event = await this.gg_bet_contract?.methods
          .current_sports_event()
          .call();
      }
    }

    async updateSportsEventProgressFlag() {
      this.sports_event_in_progress = await this.gg_bet_contract?.methods
        .sports_event_in_progress()
        .call();
    }
  }
</script>

<style lang="scss">
  @import './style';
  @import './vars';

  body {
    font-family: 'Roboto Condensed', sans-serif;
    background: $bgColor;
  }
</style>
