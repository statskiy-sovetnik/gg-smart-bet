<template>
  <div class="container">
    <h2 class="loading-text">Loading...</h2>
  </div>
</template>
<script>
  export default {
    name: 'Loading',
  };
</script>
<style lang="scss" scoped>
  @import '../vars';

  .loading-text {
    font-style: italic;
    font-size: 65px;
    color: $pinkActive;
  }
</style>
