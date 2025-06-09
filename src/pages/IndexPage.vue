<template>
  <q-page class="row items-start justify-center text-center">
    <q-banner ref="banner" v-if="mode === 'pwa'" class="bg-orange col-12">
      <template v-slot:avatar>
        <q-icon name="sym_o_warning" />
      </template>
      <span class="text-h5" v-html="$t('index.pwaWarn')" />
    </q-banner>

    <div
      v-if="currentContent === 'initial'"
      class="col-12"
      :class="{ 'self-center': mode !== 'pwa' }"
    >
      <div class="text-h1 text-center brand-font q-pb-xl">DOTYKER</div>

      <h3>{{ $t('index.congratulations') }}</h3>
      <p class="text-subtitle1">{{ $t('index.subtitle') }}</p>

      <p class="text-body1" v-html="$t('index.instructions')"></p>

      <div class="q-pa-md q-gutter-sm">
        <q-btn
          size="xl"
          :label="$t('index.standalone')"
          icon="sym_o_jamboard_kiosk"
          @click="chooseStandalone"
        />
        <q-btn size="xl" icon="sym_o_graph_2" :label="$t('index.managed')" @click="chooseManaged" />
      </div>
      <div>
        <q-btn
          size="xl"
          icon="sym_o_menu_book"
          :label="$t('index.docs')"
          @click="navigateDocumentation"
        />
      </div>
    </div>
    <div v-if="currentContent === 'standalone'">
      <standalone-wizard label="test" />
      <q-btn size="xl" icon="sym_o_arrow_back" :label="$t('common.back')" @click="goBack()" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StandaloneWizard from 'components/standalone-wizard/StandaloneWizard.vue'

const currentContent = ref<'initial' | 'standalone' | 'managed'>('initial')
const mode = process.env.MODE

const chooseStandalone = () => {
  currentContent.value = 'standalone'
}

const chooseManaged = () => {
  currentContent.value = 'managed'
}

const goBack = () => {
  currentContent.value = 'initial'
}

const navigateDocumentation = () => {
  if (process.env.MODE === 'electron') {
    window.location.href = '/browser?url=https://dotyker.org/docs/category/overview'
  } else {
    window.open('https://dotyker.org/docs/category/overview', '_blank')
  }
}
</script>
