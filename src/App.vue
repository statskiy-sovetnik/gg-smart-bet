<template>
  <div class="gg-root">
    <page-header />
  </div>
</template>

<script lang="ts">
  import {Options, Vue} from 'vue-class-component';
  import HelloWorld from './components/HelloWorld.vue';
  import PageHeader from '@/components/PageHeader.vue';

  @Options({
    components: {
      PageHeader,
      HelloWorld,
    },
  })
  export default class App extends Vue {}
</script>

<style lang="scss">
  body {
    background: blue;
  }
</style>
