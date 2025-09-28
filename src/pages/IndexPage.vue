<template>
  <q-page class="row flex-center">
    <div class="boot-logo brand-font non-selectable">DOTYKER</div>
  </q-page>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.body--light {
  --glow-color: #000;
}

.body--dark {
  --glow-color: #fff;
}

.boot-logo {
  animation: glow 1.5s infinite alternate;
  font-size: 16vw;
}

@keyframes glow {
  to {
    text-shadow: 0 0 30px var(--glow-color);
  }
}
</style>
