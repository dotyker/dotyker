// src/plugins/core/PluginManager.ts

import type { App, Component } from 'vue'
import type { Router } from 'vue-router'
import { useDeviceState } from '@/stores/device-state'
import type { PluginId, PluginConfigRegistry, PluginConfigType } from '@/plugins/types/registry'
import type {
  PluginDefinition,
  PluginLifecycle,
  BasePluginConfig,
  PluginAPI,
} from '@/plugins/types/base'
import { PluginAPIImpl } from './PluginAPI'

export interface PluginInstance {
  id: PluginId
  definition: PluginDefinition
  lifecycle?: PluginLifecycle
  component?: Component
  api: PluginAPI
  state: 'unloaded' | 'loading' | 'loaded' | 'active' | 'error'
  error?: Error
}

export class PluginManager {
  private plugins = new Map<PluginId, PluginInstance>()
  private app: App
  private router: Router
  private store: ReturnType<typeof useDeviceState>

  constructor(app: App, router: Router) {
    this.app = app
    this.router = router
    this.store = useDeviceState()
  }

  /**
   * Register a plugin definition
   */
  async register<T extends PluginId>(
    pluginId: T,
    definition: PluginDefinition<PluginConfigType<T>>,
  ): Promise<void> {
    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already registered`)
    }

    // Create plugin API instance
    const api = new PluginAPIImpl(pluginId, this)

    // Create plugin instance
    const instance: PluginInstance = {
      id: pluginId,
      definition: definition as PluginDefinition,
      lifecycle: definition.lifecycle,
      component: definition.component,
      api,
      state: 'unloaded',
    }

    this.plugins.set(pluginId, instance)

    // Register component globally if provided
    if (definition.component) {
      this.app.component(`plugin-${pluginId}`, definition.component)
    }

    // Register routes if provided
    if (definition.routes && definition.routes.length > 0) {
      definition.routes.forEach((route) => {
        this.router.addRoute({
          ...route,
          path: `/plugins/${pluginId}${route.path}`,
          name: `plugin-${pluginId}-${route.name}`,
        })
      })
    }

    // Initialize config if not exists
    if (!this.store.hasPluginConfig(pluginId)) {
      this.store.initializePlugin(pluginId, definition.configDefaults as any, false)
    }
  }

  /**
   * Load a plugin
   */
  async load(pluginId: PluginId): Promise<void> {
    const instance = this.plugins.get(pluginId)
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (instance.state === 'loaded' || instance.state === 'active') {
      return // Already loaded
    }

    instance.state = 'loading'

    try {
      // Call onInit lifecycle hook
      if (instance.lifecycle?.onInit) {
        await instance.lifecycle.onInit()
      }

      instance.state = 'loaded'

      // Auto-activate if enabled
      if (this.store.isPluginEnabled(pluginId)) {
        await this.activate(pluginId)
      }
    } catch (error) {
      instance.state = 'error'
      instance.error = error as Error
      throw error
    }
  }

  /**
   * Activate a plugin
   */
  async activate(pluginId: PluginId): Promise<void> {
    const instance = this.plugins.get(pluginId)
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (instance.state === 'active') {
      return // Already active
    }

    if (instance.state !== 'loaded') {
      await this.load(pluginId)
    }

    // Enable in store
    this.store.enablePlugin(pluginId)

    // Call onActivate lifecycle hook
    if (instance.lifecycle?.onActivate) {
      await instance.lifecycle.onActivate()
    }

    instance.state = 'active'
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: PluginId): Promise<void> {
    const instance = this.plugins.get(pluginId)
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    if (instance.state !== 'active') {
      return // Not active
    }

    // Disable in store
    this.store.disablePlugin(pluginId)

    // Call onDeactivate lifecycle hook
    if (instance.lifecycle?.onDeactivate) {
      await instance.lifecycle.onDeactivate()
    }

    instance.state = 'loaded'
  }

  /**
   * Unload a plugin
   */
  async unload(pluginId: PluginId): Promise<void> {
    const instance = this.plugins.get(pluginId)
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    // Deactivate first if active
    if (instance.state === 'active') {
      await this.deactivate(pluginId)
    }

    // Call onDestroy lifecycle hook
    if (instance.lifecycle?.onDestroy) {
      await instance.lifecycle.onDestroy()
    }

    instance.state = 'unloaded'
  }

  /**
   * Get plugin instance
   */
  getPlugin(pluginId: PluginId): PluginInstance | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get active plugins
   */
  getActivePlugins(): PluginInstance[] {
    return this.getAllPlugins().filter((p) => p.state === 'active')
  }

  /**
   * Check if plugin is registered
   */
  hasPlugin(pluginId: PluginId): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Update plugin configuration
   */
  async updatePluginConfig<T extends PluginId>(
    pluginId: T,
    config: Partial<PluginConfigType<T>>,
  ): Promise<void> {
    const instance = this.plugins.get(pluginId)
    if (!instance) {
      throw new Error(`Plugin ${pluginId} not found`)
    }

    const oldConfig = this.store.getPluginConfig(pluginId)
    this.store.updatePluginConfig(pluginId, config)
    const newConfig = this.store.getPluginConfig(pluginId)

    // Notify plugin of config change
    if (instance.lifecycle?.onConfigUpdate) {
      instance.lifecycle.onConfigUpdate(newConfig, oldConfig)
    }
  }

  /**
   * Load all enabled plugins
   */
  async loadEnabledPlugins(): Promise<void> {
    const enabledIds = this.store.enabledPlugins

    for (const pluginId of enabledIds) {
      if (this.hasPlugin(pluginId)) {
        try {
          await this.load(pluginId)
        } catch (error) {
          console.error(`Failed to load plugin ${pluginId}:`, error)
        }
      }
    }
  }

  /**
   * Get router instance (for plugin API)
   */
  getRouter(): Router {
    return this.router
  }

  /**
   * Get app instance (for plugin API)
   */
  getApp(): App {
    return this.app
  }
}
