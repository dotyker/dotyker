// src/plugins/built-in/weather/index.ts

import type { PluginDefinition } from '@/plugins/types/base'
import type { WeatherPluginConfig } from '@/plugins/types/configs'
import WeatherWidget from './WeatherWidget.vue'

export const weatherPlugin: PluginDefinition<WeatherPluginConfig> = {
  manifest: {
    id: 'weather-widget',
    name: 'Weather Widget',
    description: 'Display current weather and forecast',
    version: '1.0.0',
    author: 'Kiosk Team',
    icon: 'cloud',
    category: 'content',
    permissions: ['network', 'location'],
  },

  component: WeatherWidget,

  configDefaults: {
    apiKey: '',
    location: {
      lat: 0,
      lon: 0,
      name: 'Current Location',
    },
    units: 'metric',
    refreshInterval: 600000, // 10 minutes
    display: {
      showForecast: true,
      forecastDays: 5,
      showAlerts: true,
      showDetails: true,
    },
  },

  lifecycle: {
    async onInit() {
      console.log('[Weather] Plugin initialized')
    },

    async onActivate() {
      console.log('[Weather] Plugin activated')
    },

    async onDeactivate() {
      console.log('[Weather] Plugin deactivated')
    },

    onConfigUpdate(newConfig, oldConfig) {
      console.log('[Weather] Config updated', { newConfig, oldConfig })
    },
  },
}
