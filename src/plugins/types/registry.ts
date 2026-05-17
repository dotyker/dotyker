// src/plugins/types/registry.ts

import type {
  WeatherPluginConfig,
  SlideShowPluginConfig,
  AnalyticsPluginConfig,
  EshopPluginConfig,
  ScreensaverPluginConfig,
  QueueManagementPluginConfig,
} from './configs'

/**
 * Central registry of all known plugins
 * Add new plugins here to get full TypeScript support
 */
export interface PluginConfigRegistry {
  'weather-widget': WeatherPluginConfig
  slideshow: SlideShowPluginConfig
  analytics: AnalyticsPluginConfig
  'eshop-browser': EshopPluginConfig
  screensaver: ScreensaverPluginConfig
  'queue-management': QueueManagementPluginConfig
  // Add more plugins here as you develop them
}

/**
 * Type helper to get all plugin IDs
 */
export type PluginId = keyof PluginConfigRegistry

/**
 * Type helper to get config type for a specific plugin
 */
export type PluginConfigType<T extends PluginId> = PluginConfigRegistry[T]

/**
 * All possible plugin configs as a union
 */
export type AnyPluginConfig = PluginConfigRegistry[PluginId]

/**
 * Plugin configs map
 */
export type PluginConfigs = {
  [K in PluginId]?: PluginConfigRegistry[K]
}

/**
 * Type guard to check if a string is a valid plugin ID
 */
export function isValidPluginId(id: string): id is PluginId {
  const validIds: PluginId[] = [
    'weather-widget',
    'slideshow',
    'analytics',
    'eshop-browser',
    'screensaver',
    'queue-management',
  ]
  return validIds.includes(id as PluginId)
}

/**
 * Plugin metadata for marketplace/UI display
 */
export interface PluginMetadata<T extends PluginId = PluginId> {
  id: T
  name: string
  description: string
  icon: string
  category: 'content' | 'interaction' | 'analytics' | 'integration' | 'utility'
  version: string
  author?: string
  screenshots?: string[]
  requirements?: {
    minVersion?: string
    hardware?: string[]
    permissions?: string[]
  }
}
