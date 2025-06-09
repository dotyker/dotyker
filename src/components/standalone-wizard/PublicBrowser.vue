<template>
  <!-- Default URL Input -->
  <q-input
    v-model="defaultUrl"
    :label="$t('standaloneWizard.interactive.publicBrowser.defaultUrlLabel')"
    :hint="$t('standaloneWizard.interactive.publicBrowser.defaultUrlHint')"
    dense
    outlined
    lazy-rules
  />

  <!-- Whitelisted URLs Section -->
  <div class="whitelist-section">
    <div class="text-subtitle2 q-mb-sm">
      {{ $t('standaloneWizard.interactive.publicBrowser.whitelistLabel') }}
    </div>
    <div class="text-caption text-grey q-mb-md">
      {{ $t('standaloneWizard.interactive.publicBrowser.whitelistHint') }}
    </div>

    <!-- URL Input Fields -->
    <q-input
      v-for="(url, index) in whitelistedUrls"
      :key="`url-${index}`"
      v-model="whitelistedUrls[index]"
      :placeholder="$t('standaloneWizard.interactive.publicBrowser.whitelistUrlPlaceholder')"
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
          v-if="whitelistedUrls.length > 1"
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface WhitelistUrlInputExposed {
  getWhitelistedUrls: () => string[]
}

const defaultUrl = ref<string>('https://dotyker.org')
const whitelistedUrls = ref<string[]>([''])

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
  const duplicates = whitelistedUrls.value.filter((u: string) => u.trim() === trimmedUrl)
  if (duplicates.length > 1) {
    return 'This URL is already added'
  }

  return true
}

// Handle input changes - auto-add new field when typing in last field
const handleInput = (index: number): void => {
  console.log('Input triggered:', index, 'value:', whitelistedUrls.value[index])

  const isLastField = index === whitelistedUrls.value.length - 1
  const currentValue = whitelistedUrls.value[index]
  const hasValue = currentValue && currentValue.trim().length > 0

  console.log('Is last field:', isLastField, 'Has value:', hasValue)

  // Add new empty field if user is typing in the last field
  if (isLastField && hasValue) {
    console.log('Adding new field')
    whitelistedUrls.value.push('')
  }
}

// Format URL (add https:// if missing)
const formatUrl = (index: number): void => {
  const url = whitelistedUrls.value[index]?.trim()
  if (!url) return

  if (!url.match(/^https?:\/\//)) {
    whitelistedUrls.value[index] = `https://${url}`
  }
}

// Remove URL field
const removeUrl = (index: number): void => {
  if (whitelistedUrls.value.length > 1) {
    whitelistedUrls.value.splice(index, 1)
  }
}

// Get clean URLs (non-empty, valid ones) - for external access
const getWhitelistedUrls = (): string[] => {
  return whitelistedUrls.value
    .map((url: string) => url.trim())
    .filter((url: string) => url && isValidUrl(url))
}

// Expose function for parent component
defineExpose<WhitelistUrlInputExposed>({
  getWhitelistedUrls,
})
</script>
