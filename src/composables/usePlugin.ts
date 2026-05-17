// src/composables/usePlugin.ts

import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useDeviceState } from '@/stores/device-state'
import type { PluginId, PluginConfigType } from '@/plugins/types/registry'
import type { PluginAPI } from '@/plugins/types/base'

/**
 * Vue composable for plugin components to interact with the plugin system
 */
export function usePlugin<T extends PluginId>(pluginId: T) {
  const store = useDeviceState()

  // Reactive config
  const config = computed(() => store.getPluginConfig(pluginId))

  // Reactive enabled state
  const enabled = computed(() => store.isPluginEnabled(pluginId))

  // Loading state
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Update configuration
  const updateConfig = async (updates: Partial<PluginConfigType<T>>): Promise<void> => {
    try {
      isLoading.value = true
      store.updatePluginConfig(pluginId, updates)
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Enable plugin
  const enable = () => {
    store.enablePlugin(pluginId)
  }

  // Disable plugin
  const disable = () => {
    store.disablePlugin(pluginId)
  }

  // Toggle enabled state
  const toggle = () => {
    store.togglePlugin(pluginId)
  }

  // Watch for config changes
  const watchConfig = (callback: (newConfig: PluginConfigType<T> | undefined) => void) => {
    return watch(config, callback, { deep: true })
  }

  // Emit plugin event
  const emit = (event: string, data?: any) => {
    const globalEvent = `plugin:${pluginId}:${event}`
    window.dispatchEvent(new CustomEvent(globalEvent, { detail: data }))
  }

  // Listen to plugin events
  const on = (event: string, handler: (data: any) => void) => {
    const globalEvent = `plugin:${pluginId}:${event}`
    const wrappedHandler = (e: Event) => {
      handler((e as CustomEvent).detail)
    }
    window.addEventListener(globalEvent, wrappedHandler)

    // Return cleanup function
    return () => window.removeEventListener(globalEvent, wrappedHandler)
  }

  // Listen to events from other plugins
  const onPluginEvent = (sourcePluginId: string, event: string, handler: (data: any) => void) => {
    const globalEvent = `plugin:${sourcePluginId}:${event}`
    const wrappedHandler = (e: Event) => {
      handler((e as CustomEvent).detail)
    }
    window.addEventListener(globalEvent, wrappedHandler)

    return () => window.removeEventListener(globalEvent, wrappedHandler)
  }

  // Storage helpers (sandboxed)
  const storage = {
    get: async (key: string): Promise<any> => {
      const storageKey = `plugin_${pluginId}_${key}`
      const value = localStorage.getItem(storageKey)
      return value ? JSON.parse(value) : null
    },

    set: async (key: string, value: any): Promise<void> => {
      const storageKey = `plugin_${pluginId}_${key}`
      localStorage.setItem(storageKey, JSON.stringify(value))
    },

    remove: async (key: string): Promise<void> => {
      const storageKey = `plugin_${pluginId}_${key}`
      localStorage.removeItem(storageKey)
    },

    clear: async (): Promise<void> => {
      const prefix = `plugin_${pluginId}_`
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
      keys.forEach((key) => localStorage.removeItem(key))
    },
  }

  return {
    // State
    config,
    enabled,
    isLoading,
    error,

    // Methods
    updateConfig,
    enable,
    disable,
    toggle,
    watchConfig,

    // Events
    emit,
    on,
    onPluginEvent,

    // Storage
    storage,
  }
}

/**
 * Composable for plugin lifecycle management
 */
export function usePluginLifecycle(
  pluginId: PluginId,
  hooks: {
    onActivate?: () => void | Promise<void>
    onDeactivate?: () => void | Promise<void>
    onConfigChange?: (newConfig: any, oldConfig: any) => void
  },
) {
  const { enabled, config, on } = usePlugin(pluginId)

  // Track if plugin was previously enabled
  const wasEnabled = ref(enabled.value)

  // Watch for enable/disable changes
  watch(enabled, async (isEnabled) => {
    if (isEnabled && !wasEnabled.value) {
      // Plugin was activated
      if (hooks.onActivate) {
        await hooks.onActivate()
      }
    } else if (!isEnabled && wasEnabled.value) {
      // Plugin was deactivated
      if (hooks.onDeactivate) {
        await hooks.onDeactivate()
      }
    }
    wasEnabled.value = isEnabled
  })

  // Watch for config changes
  if (hooks.onConfigChange) {
    let oldConfig = config.value
    watch(
      config,
      (newConfig) => {
        if (newConfig && oldConfig) {
          hooks.onConfigChange!(newConfig, oldConfig)
        }
        oldConfig = newConfig
      },
      { deep: true },
    )
  }

  // Handle lifecycle events
  onMounted(async () => {
    if (enabled.value && hooks.onActivate) {
      await hooks.onActivate()
    }
  })

  onUnmounted(async () => {
    if (enabled.value && hooks.onDeactivate) {
      await hooks.onDeactivate()
    }
  })
}
