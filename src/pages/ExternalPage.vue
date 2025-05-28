<template>
  <q-page class="column no-wrap full-height">
    <!-- Navigation Bar -->
    <div class="row items-center q-pa-md bg-primary text-white shadow-2">
      <!-- Navigation Controls -->
      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          icon="sym_o_home"
          size="md"
          @click="goHome"
          :disable="isHome"
          color="black"
        >
          <q-tooltip>Home</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="sym_o_arrow_back"
          size="md"
          @click="goBack"
          :disable="!canGoBack"
          color="white"
        >
          <q-tooltip>Back (External Navigation Only)</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="sym_o_arrow_forward"
          size="md"
          @click="goForward"
          :disable="!canGoForward"
          color="white"
        >
          <q-tooltip>Forward (External Navigation Only)</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="sym_o_refresh"
          size="md"
          @click="refresh"
          :disable="isHome"
          color="white"
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          icon="sym_o_open_in_new"
          size="md"
          @click="openInNewTab"
          :disable="isHome"
          color="white"
        >
          <q-tooltip>Open in New Tab</q-tooltip>
        </q-btn>
      </div>

      <!-- URL Input -->
      <div class="col q-mx-md">
        <q-input
          v-model="urlInput"
          placeholder="Enter URL (e.g., https://example.com)"
          bg-color="white"
          color="primary"
          dense
          outlined
          @keyup.enter="navigateToUrl"
        >
          <template #append>
            <q-btn flat round icon="sym_o_search" @click="navigateToUrl" color="primary" />
          </template>
        </q-input>
      </div>

      <!-- Status -->
      <div class="row items-center q-gutter-sm">
        <q-spinner v-if="isLoading" color="white" size="sm" />
        <q-badge v-if="hasFrameError" color="warning" icon="sym_o_warning"> Blocked </q-badge>
      </div>
    </div>

    <!-- Content Area -->
    <div class="col relative-position">
      <!-- Home Page -->
      <div v-if="isHome" class="absolute-full column items-center justify-center q-pa-xl">
        <HomeContent @navigate="navigateToQuickUrl" />
      </div>

      <!-- Iframe Container -->
      <div v-else class="absolute-full">
        <iframe
          ref="iframeRef"
          :src="currentUrl"
          class="full-width full-height"
          frameborder="0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          @load="onIframeLoad"
          @error="onIframeError"
        />
      </div>

      <!-- Loading Overlay -->
      <LoadingOverlay v-if="isLoading && !isHome" />

      <!-- Error Overlay -->
      <ErrorOverlay
        v-if="hasFrameError"
        :current-url="currentUrl"
        @retry="refresh"
        @open-external="openInNewTab"
      />
    </div>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfoDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Navigation Limitations</div>
        </q-card-section>
        <q-card-section>
          <p class="text-body2">Due to browser security policies:</p>
          <ul class="text-body2">
            <li>Some sites (Google, Facebook, etc.) cannot be displayed in frames</li>
            <li>Navigation history only tracks URLs you enter directly</li>
            <li>Links clicked inside websites won't update the back/forward buttons</li>
            <li>Use "Open in New Tab" for full functionality</li>
          </ul>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Got it" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="sym_o_info" color="accent" @click="showInfoDialog = true" />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HomeContent from 'components/HomeContent.vue'
import LoadingOverlay from 'components/LoadingOverlay.vue'
import ErrorOverlay from 'components/ErrorOverlay.vue'

// State
const iframeRef = ref<HTMLIFrameElement | null>(null)
const urlInput = ref('')
const currentUrl = ref('')
const isLoading = ref(false)
const hasFrameError = ref(false)
const showInfoDialog = ref(false)

// Navigation history (only tracks direct URL entries, not iframe navigation)
const urlHistory = ref<string[]>([])
const historyIndex = ref(-1)

// Computed
const isHome = computed(() => !currentUrl.value)
const canGoBack = computed(() => historyIndex.value > 0)
const canGoForward = computed(() => historyIndex.value < urlHistory.value.length - 1)

// Navigation methods
const navigateToUrl = (): void => {
  const url = normalizeUrl(urlInput.value.trim())
  if (url) {
    navigateTo(url)
  }
}

const navigateToQuickUrl = (url: string): void => {
  urlInput.value = url
  navigateTo(url)
}

const navigateTo = (url: string): void => {
  resetState()
  currentUrl.value = url
  urlInput.value = url
  isLoading.value = true
  addToHistory(url)
}

const goHome = (): void => {
  resetState()
  currentUrl.value = ''
  urlInput.value = ''
}

const goBack = (): void => {
  if (canGoBack.value) {
    historyIndex.value--
    const url = urlHistory.value[historyIndex.value]
    if (!url) return
    loadFromHistory(url)
  }
}

const goForward = (): void => {
  if (canGoForward.value) {
    historyIndex.value++
    const url = urlHistory.value[historyIndex.value]
    if (!url) return
    loadFromHistory(url)
  }
}

const refresh = (): void => {
  if (currentUrl.value) {
    resetState()
    isLoading.value = true
    // Force reload by resetting src
    if (iframeRef.value) {
      const url = currentUrl.value
      iframeRef.value.src = ''
      setTimeout(() => {
        if (iframeRef.value) {
          iframeRef.value.src = url
        }
      }, 100)
    }
  }
}

const openInNewTab = (): void => {
  if (currentUrl.value) {
    window.open(currentUrl.value, '_blank')
  }
}

// Helper methods
const normalizeUrl = (input: string): string => {
  if (!input) return ''

  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input
  }

  // Check if it looks like a domain
  if (input.includes('.') && !input.includes(' ')) {
    return `https://${input}`
  }

  // Treat as search query
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`
}

const addToHistory = (url: string): void => {
  // Remove forward history when adding new URL
  urlHistory.value = urlHistory.value.slice(0, historyIndex.value + 1)
  urlHistory.value.push(url)
  historyIndex.value = urlHistory.value.length - 1
}

const loadFromHistory = (url: string): void => {
  resetState()
  currentUrl.value = url
  urlInput.value = url
  isLoading.value = true
}

const resetState = (): void => {
  isLoading.value = false
  hasFrameError.value = false
}

// Event handlers
const onIframeLoad = (): void => {
  isLoading.value = false
  hasFrameError.value = false
}

const onIframeError = (): void => {
  isLoading.value = false
  hasFrameError.value = true
}

// Monitor iframe for frame-denial errors
const monitorIframe = (): void => {
  if (iframeRef.value) {
    const iframe = iframeRef.value

    // Set up error detection
    const checkFrameError = (): void => {
      try {
        // This will throw if the frame is blocked
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        iframe.contentWindow?.location.href
      } catch (error) {
        if (error instanceof DOMException) {
          hasFrameError.value = true
          isLoading.value = false
        }
      }
    }

    // Check after a short delay
    setTimeout(checkFrameError, 2000)
  }
}

// Watch for iframe changes
const setupIframeWatcher = (): void => {
  if (iframeRef.value) {
    iframeRef.value.addEventListener('load', () => {
      onIframeLoad()
      monitorIframe()
    })

    iframeRef.value.addEventListener('error', onIframeError)
  }
}

// Initialize
onMounted(() => {
  setupIframeWatcher()
})
</script>
