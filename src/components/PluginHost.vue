<!-- src/components/PluginHost.vue -->
<template>
  <div class="plugin-host" :class="`plugin-host--${pluginId}`">
    <!-- Loading state -->
    <div v-if="loading" class="plugin-host__loading">
      <q-spinner-cube color="primary" size="50px" />
      <p>Loading {{ pluginId }}...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="plugin-host__error">
      <q-banner class="bg-negative text-white">
        <template v-slot:avatar>
          <q-icon name="error" />
        </template>
        Plugin {{ pluginId }} failed to load: {{ error.message }}
      </q-banner>
    </div>

    <!-- Plugin not enabled -->
    <div v-else-if="!enabled" class="plugin-host__disabled">
      <q-banner class="bg-warning">
        <template v-slot:avatar>
          <q-icon name="power_off" />
        </template>
        Plugin {{ pluginId }} is disabled
        <template v-slot:action>
          <q-btn flat label="Enable" @click="enablePlugin" />
        </template>
      </q-banner>
    </div>

    <!-- Plugin component -->
    <component
      v-else-if="pluginComponent"
      :is="pluginComponent"
      v-bind="componentProps"
      @error="handlePluginError"
    />

    <!-- Fallback content -->
    <div v-else class="plugin-host__fallback">
      <slot name="fallback">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6">{{ pluginId }}</div>
            <div class="text-subtitle2">No component registered</div>
          </q-card-section>
        </q-card>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured, watch } from 'vue'
import { useQuasar } from 'quasar'
import { usePlugin } from '@/composables/usePlugin'
import type { PluginId } from '@/plugins/types/registry'

// Props
const props = defineProps<{
  pluginId: PluginId
  componentProps?: Record<string, any>
  autoLoad?: boolean
  showError?: boolean
  showDisabled?: boolean
}>()

// Emit events
const emit = defineEmits<{
  loaded: []
  error: [error: Error]
  enabled: []
  disabled: []
}>()

// Quasar
const $q = useQuasar()

// Plugin composable
const { config, enabled, enable } = usePlugin(props.pluginId)

// State
const loading = ref(false)
const error = ref<Error | null>(null)

// Computed component name
const pluginComponent = computed(() => {
  if (!enabled.value) return null
  // Component should be registered as plugin-{id}
  return `plugin-${props.pluginId}`
})

// Enable plugin
const enablePlugin = async () => {
  try {
    loading.value = true
    enable()
    emit('enabled')
  } catch (err) {
    error.value = err as Error
    emit('error', err as Error)
  } finally {
    loading.value = false
  }
}

// Handle plugin errors
const handlePluginError = (err: Error) => {
  error.value = err
  emit('error', err)

  if (props.showError !== false) {
    $q.notify({
      type: 'negative',
      message: `Plugin error: ${err.message}`,
      caption: props.pluginId,
    })
  }
}

// Error boundary
onErrorCaptured((err: Error) => {
  handlePluginError(err)
  return false // Prevent propagation
})

// Watch enabled state
watch(enabled, (isEnabled) => {
  if (isEnabled) {
    emit('enabled')
  } else {
    emit('disabled')
  }
})

// Auto-load on mount if requested
onMounted(async () => {
  if (props.autoLoad && enabled.value) {
    loading.value = true
    // Simulate loading time
    await new Promise((resolve) => setTimeout(resolve, 100))
    loading.value = false
    emit('loaded')
  }
})
</script>

<style scoped lang="scss">
.plugin-host {
  position: relative;
  width: 100%;
  height: 100%;

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1rem;

    p {
      margin: 0;
      color: $grey-7;
    }
  }

  &__error {
    padding: 1rem;
  }

  &__disabled {
    padding: 1rem;
  }

  &__fallback {
    padding: 1rem;
  }
}
</style>
