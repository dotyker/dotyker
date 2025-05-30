<template>
  <q-card flat class="my-card q-pa-lg q-mb-lg">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <div class="text-h5">{{ $t('standaloneWizard.interactive.label') }}</div>
      <q-btn-toggle
        v-model="type"
        spread
        no-wrap
        unelevated
        class="no-wrap"
        toggle-color="blue"
        :options="[
          { value: 'multiApp', label: $t('standaloneWizard.interactive.multiApp') },
          { value: 'singleApp', label: $t('standaloneWizard.interactive.singleApp') },
          { value: 'publicBrowser', label: $t('standaloneWizard.interactive.publicBrowser') },
        ]"
      />

      <div class="text-h5">{{ $t('standaloneWizard.nonInteractive.label') }}</div>
      <q-btn-toggle
        v-model="type"
        spread
        no-wrap
        unelevated
        toggle-color="blue"
        :options="[
          { value: 'staticWeb', label: $t('standaloneWizard.nonInteractive.staticWeb') },
          { value: 'playlistWeb', label: $t('standaloneWizard.nonInteractive.playlistWeb') },
          { value: 'media', label: $t('standaloneWizard.nonInteractive.media') },
        ]"
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
        filled
        v-model="name"
        :label="$t('standaloneWizard.name')"
        :hint="$t('standaloneWizard.nameDescription')"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
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
          class="q-mx-sm"
          :label="$t('common.submit')"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref } from 'vue'

const generateRandomDeviceName = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomSuffix = Array.from({ length: 7 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join('')

  return `DOTYKER-${randomSuffix}`
}

const $q = useQuasar()

const type = ref('multiApp')
const darkMode = ref($q.dark.isActive)
const name = ref(generateRandomDeviceName())
const changeDarkMode = () => {
  $q.dark.set(darkMode.value)
}

const onSubmit = () => {
  $q.notify({
    color: 'green-4',
    textColor: 'white',
    icon: 'sym_o_cloud_done',
    message: 'Submitted',
  })
}

const onReset = () => {
  name.value = generateRandomDeviceName()
}
</script>
