<template>
  <q-card flat class="my-card q-pa-lg q-mb-lg">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div class="text-h5">{{ $t('standaloneWizard.label') }}</div>
      <q-btn
        square
        size="2rem"
        icon="sym_o_web_asset"
        stack
        :label="$t('standaloneWizard.singleWeb')"
        padding="lg"
      />
      <q-btn square size="2rem" icon="sym_o_select_window" stack padding="lg">{{
        $t('standaloneWizard.multiWeb')
      }}</q-btn>
      <q-btn
        flat
        size="2rem"
        icon="sym_o_add"
        stack
        :label="$t('standaloneWizard.pluginMarketplace')"
        padding="lg"
        class="marketplace"
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
import type { Component } from 'vue'
import type { AppType } from 'types/wizard'

// Composables
const $q = useQuasar()
const { generateRandomDeviceName } = useDeviceNameGenerator()
const { nameValidationRules } = useFormValidation()

// Reactive state
const type = ref<AppType>('singleWeb')
const darkMode = ref<boolean>($q.dark.isActive)
const name = ref<string>(generateRandomDeviceName())

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

<style lang="css">
.marketplace {
  border: 2px dashed #ccc;
}
</style>
