<template>
  <q-card flat class="my-card q-pa-lg q-mb-lg">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div class="text-h4">{{ $t('standaloneWizard.label') }}</div>
      <q-input
        dense
        outlined
        v-model="name"
        :label="$t('standaloneWizard.name')"
        :hint="$t('standaloneWizard.nameDescription')"
        lazy-rules
        :rules="nameValidationRules"
      >
        <template v-slot:after>
          <q-btn
            :icon="$q.dark.isActive ? 'sym_o_dark_mode' : 'sym_o_light_mode'"
            @click="changeDarkMode"
          />
        </template>
      </q-input>

      <component
        :is="selectedComponent"
        :name="name"
        :current-stage="type"
        @update:stage="handleStageUpdate"
      />

      <div>
        <q-btn
          type="reset"
          size="xl"
          icon="sym_o_refresh"
          flat
          class="q-mx-sm"
          :label="$t('common.reset')"
        />
        <q-btn
          type="submit"
          size="xl"
          icon="sym_o_check"
          flat
          class="q-mx-sm"
          :label="$t('common.submit')"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, computed, defineAsyncComponent } from 'vue'
import { useDeviceNameGenerator } from 'composables/useDeviceNameGenerator'
import { useFormValidation } from 'composables/useFormValidation'
import type { Component } from 'vue'
import type { StandaloneWizardStage } from 'types/wizard'

// Composables
const $q = useQuasar()
const { generateRandomDeviceName } = useDeviceNameGenerator()
const { nameValidationRules } = useFormValidation()

// Reactive state
const type = ref<StandaloneWizardStage>('selectDeviceMode')
const name = ref<string>(generateRandomDeviceName())

const componentMap: Record<StandaloneWizardStage, () => Promise<Component>> = {
  selectDeviceMode: () => import('components/standalone-wizard/SelectDeviceMode.vue'),
  websitePage: () => import('components/standalone-wizard/WebsitePage.vue'),
  mediaSlideshow: () => import('components/standalone-wizard/MediaSlideshow.vue'),
  pluginMarketplace: () => import('components/standalone-wizard/PluginMarketplace.vue'),
}

const selectedComponent = computed(() => {
  const loader = componentMap[type.value]
  return loader ? defineAsyncComponent(loader) : null
})

// Methods
const changeDarkMode = (): void => {
  $q.dark.set(!$q.dark.isActive)
}

const handleStageUpdate = (newStage: StandaloneWizardStage): void => {
  type.value = newStage
}

const onSubmit = (): void => {
  $q.notify({
    color: 'green-4',
    textColor: 'white',
    icon: 'sym_o_cloud_done',
    message: 'Submitted',
  })
}

const onReset = (): void => {
  name.value = generateRandomDeviceName()
  type.value = 'selectDeviceMode'
}
</script>
