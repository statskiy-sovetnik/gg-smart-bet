<template>
  <header class="gg-header">
    <div class="container">
      {{ ggStr }}
    </div>
  </header>
</template>
<script lang="ts">
  import {Options, Vue} from 'vue-class-component';

  @Options({
    props: {
      ggStr: {
        type: String,
        default: 'OhMyGg!',
      },
    },
  })
  export default class PageHeader extends Vue {}
</script>
<style scoped></style>
