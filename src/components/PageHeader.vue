<template>
  <header class="gg-header">
    {{ ggStr }}
  </header>
</template>
<script lang="ts">
  import {Options, Vue} from 'vue-class-component';

  /*
ЗАКОММИТЬ А ПОТОМ SASS_LOADER
* */

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
