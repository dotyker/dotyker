<template>
  <q-card flat class="my-card q-pa-lg q-mb-lg">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div class="text-h5">{{ $t('standaloneWizard.label') }}</div>
      <q-btn-toggle
        v-model="type"
        spread
        no-wrap
        unelevated
        class="no-wrap"
        toggle-color="blue"
        :options="interactiveOptions"
      />

      <div class="text-h5">{{ $t('standaloneWizard.colorTheme') }}</div>
      <q-toggle
        v-model="darkMode"
        size="xl"
        icon-color="blue"
        checked-icon="sym_o_dark_mode"
        unchecked-icon="sym_o_light_mode"
        @click="changeDarkMode"
      />

      <q-input
        dense
        outlined
        v-model="name"
        :label="$t('standaloneWizard.name')"
        :hint="$t('standaloneWizard.nameDescription')"
        lazy-rules
        :rules="nameValidationRules"
      />

      <component
        :is="selectedComponent"
        :name="name"
        :dark-mode="darkMode"
        @update:name="handleNameUpdate"
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
import { useI18n } from 'vue-i18n'
import type { Component } from 'vue'
import type { AppType, ToggleOption } from 'types/wizard'

// Composables
const $q = useQuasar()
const { t } = useI18n()
const { generateRandomDeviceName } = useDeviceNameGenerator()
const { nameValidationRules } = useFormValidation()

// Reactive state
const type = ref<AppType>('singleWeb')
const darkMode = ref<boolean>($q.dark.isActive)
const name = ref<string>(generateRandomDeviceName())

// Computed properties
const interactiveOptions = computed<ToggleOption[]>(() => [
  { value: 'singleWeb', label: t('standaloneWizard.singleWeb') },
  { value: 'multiWeb', label: t('standaloneWizard.multiWeb') },
  { value: 'pluginMarketplace', label: t('standaloneWizard.pluginMarketplace') },
])

const componentMap: Record<AppType, () => Promise<Component>> = {
  singleWeb: () => import('components/standalone-wizard/SingleWeb.vue'),
  multiWeb: () => import('components/standalone-wizard/MultiWeb.vue'),
  pluginMarketplace: () => import('components/standalone-wizard/PluginMarketplace.vue'),
}

const selectedComponent = computed(() => {
  const loader = componentMap[type.value]
  return loader ? defineAsyncComponent(loader) : null
})

// Methods
const changeDarkMode = (): void => {
  $q.dark.set(darkMode.value)
}

const handleNameUpdate = (newName: string): void => {
  name.value = newName
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
  type.value = 'singleWeb'
}
</script>
