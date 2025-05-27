<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="brand-font"> DOTYKER </q-toolbar-title>

        <div class="brand-font">Quasar v{{ $q.version }}</div>
        <q-btn flat dense round icon="sym_o_contrast" aria-label="Menu" @click="$q.dark.toggle()" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
