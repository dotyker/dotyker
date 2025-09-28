<template>
  <!-- Default URL Input -->
  <!-- <q-input
    v-model="defaultUrl"
    :label="$t('standaloneWizard.interactive.publicBrowser.defaultUrlLabel')"
    :hint="$t('standaloneWizard.interactive.publicBrowser.defaultUrlHint')"
    dense
    outlined
    lazy-rules
  /> -->

  <!-- Whitelisted URLs Section -->
  <div class="whitelist-section">
    <div class="text-subtitle2 q-mb-sm">
      {{ $t('standaloneWizard.websitePage.urlList') }}
    </div>

    <!-- URL Input Fields -->
    <q-input
      v-for="(url, index) in websiteUrls"
      :key="`url-${index}`"
      v-model="websiteUrls[index]"
      :placeholder="$t('standaloneWizard.websitePage.newUrl')"
      :rules="[validateSingleUrl]"
      @update:model-value="handleInput(index)"
      @blur="formatUrl(index)"
      dense
      outlined
    >
      <template #prepend>
        <q-icon name="sym_o_link" size="sm" />
      </template>

      <template #append>
        <q-btn
          v-if="websiteUrls.length > 1 && index !== websiteUrls.length - 1"
          icon="sym_o_delete"
          size="sm"
          flat
          round
          color="negative"
          @click="removeUrl(index)"
          :title="$t('standaloneWizard.interactive.publicBrowser.removeUrl')"
        />
      </template>
    </q-input>

    <q-select
      v-model="refreshIntervalMode"
      :options="refreshIntervalModeOptions"
      :label="$t('standaloneWizard.websitePage.refreshInterval')"
      :hint="$t('standaloneWizard.websitePage.slideIntervalHint')"
      emit-value
      map-options
      outlined
      dense
    >
      <template #after>
        <q-input
          v-if="refreshIntervalMode == 'on-website-change-and-every'"
          v-model="refreshInterval"
          type="number"
          :label="$t('standaloneWizard.websitePage.seconds')"
          dense
          outlined
        >
        </q-input>
        <!-- <q-select
          v-if="refreshIntervalMode == 'on-website-change-and-every'"
          v-model="refreshInterval"
          :options="refreshIntervalOptions"
          :label-slot="false"
          dense
          outlined
        /> -->
      </template>
    </q-select>

    <q-select
      v-if="websiteUrls.length > 2"
      v-model="slideInterval"
      :options="slideIntervalOptions"
      :label="$t('standaloneWizard.websitePage.slideInterval')"
      :hint="$t('standaloneWizard.websitePage.slideIntervalHint')"
      class="q-mt-sm"
      emit-value
      map-options
      dense
      outlined
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface WhitelistUrlInputExposed {
  getWebsiteUrls: () => string[]
}

const { t } = useI18n()

const websiteUrls = ref<string[]>([''])
const refreshIntervalMode = ref('on-website-change')
const refreshIntervalModeOptions = [
  { label: t('standaloneWizard.websitePage.onWebsiteChange'), value: 'on-website-change' },
  {
    label: t('standaloneWizard.websitePage.onWebsiteChangeAndEvery'),
    value: 'on-website-change-and-every',
  },
  { label: t('standaloneWizard.websitePage.never'), value: 'never' },
]
const refreshInterval = ref<number>(5)
const slideInterval = ref<number>(60)
const slideIntervalOptions = [
  { label: t('standaloneWizard.websitePage.fiveSeconds'), value: 5 },
  { label: t('standaloneWizard.websitePage.fifteenSeconds'), value: 15 },
  { label: t('standaloneWizard.websitePage.thirtySeconds'), value: 30 },
  { label: t('standaloneWizard.websitePage.oneMinute'), value: 60 },
  { label: t('standaloneWizard.websitePage.fiveMinute'), value: 300 },
]

// URL validation function
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true // Allow empty for optional fields

  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Validation rule for single URL
const validateSingleUrl = (url: string): boolean | string => {
  if (!url.trim()) return true // Empty is allowed

  if (!isValidUrl(url)) {
    return 'Please enter a valid URL'
  }

  // Check for duplicates
  const trimmedUrl = url.trim()
  const duplicates = websiteUrls.value.filter((u: string) => u.trim() === trimmedUrl)
  if (duplicates.length > 1) {
    return 'This URL is already added'
  }

  return true
}

// Handle input changes - auto-add new field when typing in last field
const handleInput = (index: number): void => {
  console.log('Input triggered:', index, 'value:', websiteUrls.value[index])

  const isLastField = index === websiteUrls.value.length - 1
  const currentValue = websiteUrls.value[index]
  const hasValue = currentValue && currentValue.trim().length > 0

  console.log('Is last field:', isLastField, 'Has value:', hasValue)

  // Add new empty field if user is typing in the last field
  if (isLastField && hasValue) {
    console.log('Adding new field')
    websiteUrls.value.push('')
  }
}

// Format URL (add https:// if missing)
const formatUrl = (index: number): void => {
  const url = websiteUrls.value[index]?.trim()
  if (!url) return

  if (!url.match(/^https?:\/\//)) {
    websiteUrls.value[index] = `https://${url}`
  }
}

// Remove URL field
const removeUrl = (index: number): void => {
  if (websiteUrls.value.length > 1) {
    websiteUrls.value.splice(index, 1)
  }
}

// Get clean URLs (non-empty, valid ones) - for external access
const getWebsiteUrls = (): string[] => {
  return websiteUrls.value
    .map((url: string) => url.trim())
    .filter((url: string) => url && isValidUrl(url))
}

// Expose function for parent component
defineExpose<WhitelistUrlInputExposed>({
  getWebsiteUrls,
})
</script>
