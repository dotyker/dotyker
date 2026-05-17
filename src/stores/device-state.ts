import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'
import type { Ref } from 'vue'

// Stores internal stats and events mainly received from main process
export const useDeviceState = defineStore(
  'device-state',
  () => {
    const initialized = ref(false) // Initial setup was completed and device is ready to serve
    const dark = ref(false) // Dark mode to persist via restarts
    const index = ref('/setup') // Default page as configured
    const pluginConfig: Ref<string, unknown> = ref()

    return {
      initialized,
      dark,
      index,
      pluginConfig,
    }
  },
  {
    persist: true,
  },
)

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDeviceState, import.meta.hot))
}
