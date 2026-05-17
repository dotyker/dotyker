<template>
  <q-card class="weather-widget">
    <q-card-section v-if="!config?.apiKey">
      <q-banner class="bg-warning">
        <template v-slot:avatar>
          <q-icon name="warning" />
        </template>
        Please configure your weather API key in settings
      </q-banner>
    </q-card-section>

    <q-card-section v-else>
      <div class="row items-center q-gutter-sm">
        <q-icon :name="weatherIcon" size="48px" :color="weatherColor" />
        <div>
          <div class="text-h4">{{ temperature }}°</div>
          <div class="text-subtitle1">{{ config.location.name }}</div>
          <div class="text-caption">{{ weatherDescription }}</div>
        </div>
      </div>

      <q-separator v-if="config.display.showDetails" spaced />

      <div v-if="config.display.showDetails" class="row q-gutter-md">
        <div class="col">
          <div class="text-caption">Feels like</div>
          <div class="text-body1">{{ feelsLike }}°</div>
        </div>
        <div class="col">
          <div class="text-caption">Humidity</div>
          <div class="text-body1">{{ humidity }}%</div>
        </div>
        <div class="col">
          <div class="text-caption">Wind</div>
          <div class="text-body1">{{ windSpeed }} {{ speedUnit }}</div>
        </div>
      </div>

      <template v-if="config.display.showForecast && forecast.length">
        <q-separator spaced />
        <div class="text-subtitle2 q-mb-sm">{{ config.display.forecastDays }}-Day Forecast</div>
        <div class="row q-gutter-sm">
          <div v-for="day in forecast" :key="day.date" class="col text-center">
            <div class="text-caption">{{ day.dayName }}</div>
            <q-icon :name="day.icon" size="24px" />
            <div class="text-body2">{{ day.high }}° / {{ day.low }}°</div>
          </div>
        </div>
      </template>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlugin, usePluginLifecycle } from '@/composables/usePlugin'
import type { WeatherPluginConfig } from '@/plugins/types/configs'

// Use plugin composable
const { config, storage, emit } = usePlugin<'weather-widget'>('weather-widget')

// State
const loading = ref(false)
const weatherData = ref<any>(null)
const forecast = ref<any[]>([])
let refreshInterval: NodeJS.Timeout | null = null

// Computed
const temperature = computed(() => {
  if (!weatherData.value) return '--'
  return Math.round(weatherData.value.main.temp)
})

const weatherDescription = computed(() => {
  if (!weatherData.value) return 'Loading...'
  return weatherData.value.weather[0].description
})

const weatherIcon = computed(() => {
  if (!weatherData.value) return 'cloud'
  const code = weatherData.value.weather[0].icon
  // Map OpenWeather icons to Quasar icons
  const iconMap: Record<string, string> = {
    '01d': 'wb_sunny',
    '01n': 'nights_stay',
    '02d': 'wb_cloudy',
    '02n': 'wb_cloudy',
    '03d': 'cloud',
    '03n': 'cloud',
    '04d': 'cloud_queue',
    '04n': 'cloud_queue',
    '09d': 'grain',
    '09n': 'grain',
    '10d': 'wb_cloudy',
    '10n': 'wb_cloudy',
    '11d': 'flash_on',
    '11n': 'flash_on',
    '13d': 'ac_unit',
    '13n': 'ac_unit',
    '50d': 'blur_on',
    '50n': 'blur_on',
  }
  return iconMap[code] || 'cloud'
})

const weatherColor = computed(() => {
  if (!weatherData.value) return 'grey'
  const temp = weatherData.value.main.temp
  if (temp < 0) return 'blue-9'
  if (temp < 10) return 'blue'
  if (temp < 20) return 'teal'
  if (temp < 30) return 'orange'
  return 'red'
})

const feelsLike = computed(() => {
  if (!weatherData.value) return '--'
  return Math.round(weatherData.value.main.feels_like)
})

const humidity = computed(() => {
  if (!weatherData.value) return '--'
  return weatherData.value.main.humidity
})

const windSpeed = computed(() => {
  if (!weatherData.value) return '--'
  return Math.round(weatherData.value.wind.speed)
})

const speedUnit = computed(() => {
  return config.value?.units === 'metric' ? 'm/s' : 'mph'
})

// Fetch weather data
async function fetchWeather() {
  if (!config.value?.apiKey || !config.value?.location) return

  try {
    loading.value = true

    // Current weather
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?` +
        `lat=${config.value.location.lat}&` +
        `lon=${config.value.location.lon}&` +
        `appid=${config.value.apiKey}&` +
        `units=${config.value.units}`,
    )

    if (!response.ok) throw new Error('Failed to fetch weather')

    weatherData.value = await response.json()

    // Store in cache
    await storage.set('lastWeatherData', {
      data: weatherData.value,
      timestamp: Date.now(),
    })

    // Emit event
    emit('weatherUpdated', weatherData.value)

    // Fetch forecast if enabled
    if (config.value.display.showForecast) {
      await fetchForecast()
    }
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error)

    // Try to load from cache
    const cached = await storage.get('lastWeatherData')
    if (cached && cached.data) {
      weatherData.value = cached.data
    }
  } finally {
    loading.value = false
  }
}

async function fetchForecast() {
  // Implementation for forecast...
  forecast.value = []
}

// Start refresh interval
function startRefresh() {
  stopRefresh()
  if (config.value?.refreshInterval) {
    refreshInterval = setInterval(fetchWeather, config.value.refreshInterval)
  }
}

// Stop refresh interval
function stopRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Plugin lifecycle
usePluginLifecycle('weather-widget', {
  onActivate: async () => {
    await fetchWeather()
    startRefresh()
  },

  onDeactivate: () => {
    stopRefresh()
  },

  onConfigChange: async (newConfig, oldConfig) => {
    if (newConfig.refreshInterval !== oldConfig.refreshInterval) {
      startRefresh()
    }
    if (
      newConfig.location.lat !== oldConfig.location.lat ||
      newConfig.location.lon !== oldConfig.location.lon ||
      newConfig.apiKey !== oldConfig.apiKey
    ) {
      await fetchWeather()
    }
  },
})

// Initial load
onMounted(() => {
  fetchWeather()
  startRefresh()
})

// Cleanup
onUnmounted(() => {
  stopRefresh()
})
</script>

<style scoped lang="scss">
.weather-widget {
  min-width: 300px;

  .q-card__section {
    padding: 16px;
  }
}
</style>
