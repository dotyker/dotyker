<template>
  <q-page class="row flex-center">
    <div class="boot-logo brand-font">DOTYKER</div>
  </q-page>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.boot-logo {
  animation: glow 1.5s infinite alternate;
  font-size: 16vw;
}

@keyframes glow {
  to {
    text-shadow: 0 0 20px black;
  }
}
</style>
