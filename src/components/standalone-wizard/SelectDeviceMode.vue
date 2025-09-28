<template>
  <q-card flat class="q-gutter-md">
    <div class="text-h5">{{ $t('standaloneWizard.selectDeviceMode') }}</div>

    <div class="row q-gutter-md justify-center">
      <q-btn
        class="mode-button"
        size="2vh"
        icon="sym_o_select_window"
        stack
        :label="$t('standaloneWizard.websitePage.label')"
        @click="selectMode('websitePage')"
      />

      <q-btn
        class="mode-button"
        size="2vh"
        icon="sym_o_wallpaper_slideshow"
        stack
        :label="$t('standaloneWizard.mediaSlideshow')"
        @click="selectMode('mediaSlideshow')"
      />

      <q-btn
        class="mode-button plugins"
        flat
        size="2vh"
        icon="sym_o_add"
        stack
        :label="$t('standaloneWizard.pluginMarketplace')"
        @click="selectMode('pluginMarketplace')"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import type { StandaloneWizardStage } from 'src/types/wizard'

const emit = defineEmits<{
  'update:stage': [stage: StandaloneWizardStage]
}>()

// Methods
const selectMode = (mode: StandaloneWizardStage): void => {
  emit('update:stage', mode)
}
</script>

<style lang="scss">
.body--light {
  .plugins {
    border: 2px dashed #ddd;
  }
}
.body--dark {
  .plugins {
    border: 2px dashed #111;
  }
}
.mode-button {
  width: 15vh;
  height: 15vh;
}
</style>
