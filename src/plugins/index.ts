// src/plugins/index.ts

import type { App } from 'vue'
import type { Router } from 'vue-router'
import { PluginManager } from './core/PluginManager'

// Import built-in plugins
import { weatherPlugin } from './built-in/weather'
// import { slideshowPlugin } from './built-in/slideshow'
// import { analyticsPlugin } from './built-in/analytics'
// import { eshopPlugin } from './built-in/eshop'
// import { screensaverPlugin } from './built-in/screensaver'
// import { queuePlugin } from './built-in/queue'

// Global plugin manager instance
let pluginManager: PluginManager | null = null

/**
 * Install and initialize the plugin system
 */
export async function installPluginSystem(app: App, router: Router) {
  // Create plugin manager
  pluginManager = new PluginManager(app, router)

  // Make it available globally
  app.provide('pluginManager', pluginManager)
  app.config.globalProperties.$pluginManager = pluginManager

  // Register built-in plugins
  await registerBuiltInPlugins(pluginManager)

  // Load enabled plugins
  await pluginManager.loadEnabledPlugins()

  return pluginManager
}

/**
 * Register all built-in plugins
 */
async function registerBuiltInPlugins(manager: PluginManager) {
  // Register weather plugin
  await manager.register('weather-widget', weatherPlugin)

  // Register other built-in plugins when ready
  // await manager.register('slideshow', slideshowPlugin)
  // await manager.register('analytics', analyticsPlugin)
  // await manager.register('eshop-browser', eshopPlugin)
  // await manager.register('screensaver', screensaverPlugin)
  // await manager.register('queue-management', queuePlugin)
}

/**
 * Get the global plugin manager instance
 */
export function getPluginManager(): PluginManager {
  if (!pluginManager) {
    throw new Error('Plugin system not initialized. Call installPluginSystem first.')
  }
  return pluginManager
}

/**
 * Load a plugin from an external source (for marketplace plugins)
 */
export async function loadExternalPlugin(pluginUrl: string, manifest: any): Promise<void> {
  const manager = getPluginManager()

  try {
    // Dynamically import the plugin module
    const module = await import(/* @vite-ignore */ pluginUrl)

    // Validate the plugin exports
    if (!module.default || !module.default.manifest) {
      throw new Error('Invalid plugin module structure')
    }

    // Register the plugin
    await manager.register(manifest.id, module.default)

    // Load and activate if auto-enable is set
    if (manifest.autoEnable) {
      await manager.load(manifest.id)
      await manager.activate(manifest.id)
    }
  } catch (error) {
    console.error(`Failed to load external plugin from ${pluginUrl}:`, error)
    throw error
  }
}

// Export types and utilities
export * from './types'
export { PluginManager } from './core/PluginManager'
export { PluginAPIImpl } from './core/PluginAPI'
