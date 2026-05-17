// src/plugins/core/PluginAPI.ts

import { Notify, Dialog } from 'quasar'
import type { PluginAPI, PluginPermission, DialogOptions, DeviceInfo } from '@/plugins/types/base'
import type { PluginId } from '@/plugins/types/registry'
import type { PluginManager } from './PluginManager'

export class PluginAPIImpl implements PluginAPI {
  private pluginId: PluginId
  private manager: PluginManager
  private eventHandlers = new Map<string, Set<Function>>()
  private grantedPermissions = new Set<PluginPermission>()

  constructor(pluginId: PluginId, manager: PluginManager) {
    this.pluginId = pluginId
    this.manager = manager
  }

  // ============================================
  // Navigation
  // ============================================

  navigateTo(path: string): void {
    const router = this.manager.getRouter()
    router.push(path)
  }

  getCurrentRoute(): string {
    const router = this.manager.getRouter()
    return router.currentRoute.value.path
  }

  // ============================================
  // Storage (sandboxed per plugin)
  // ============================================

  storage = {
    get: async (key: string): Promise<any> => {
      const storageKey = `plugin_${this.pluginId}_${key}`
      const value = localStorage.getItem(storageKey)
      return value ? JSON.parse(value) : null
    },

    set: async (key: string, value: any): Promise<void> => {
      const storageKey = `plugin_${this.pluginId}_${key}`
      localStorage.setItem(storageKey, JSON.stringify(value))
    },

    remove: async (key: string): Promise<void> => {
      const storageKey = `plugin_${this.pluginId}_${key}`
      localStorage.removeItem(storageKey)
    },

    clear: async (): Promise<void> => {
      // Clear only this plugin's storage
      const prefix = `plugin_${this.pluginId}_`
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix))
      keys.forEach((key) => localStorage.removeItem(key))
    },
  }

  // ============================================
  // Events
  // ============================================

  emit(event: string, data?: any): void {
    const globalEvent = `plugin:${this.pluginId}:${event}`
    window.dispatchEvent(new CustomEvent(globalEvent, { detail: data }))

    // Also emit to local handlers
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)!.add(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  // ============================================
  // UI Notifications & Dialogs
  // ============================================

  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const colors = {
      info: 'primary',
      success: 'positive',
      warning: 'warning',
      error: 'negative',
    }

    Notify.create({
      message: `[${this.pluginId}] ${message}`,
      color: colors[type],
      position: 'bottom-right',
      timeout: 3000,
      actions: [{ icon: 'close', color: 'white', handler: () => {} }],
    })
  }

  async showDialog(options: DialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      Dialog.create({
        title: options.title,
        message: options.message,
        ok: {
          label: options.confirmText || 'OK',
          color: 'primary',
        },
        cancel:
          options.type === 'confirm'
            ? {
                label: options.cancelText || 'Cancel',
                color: 'grey',
              }
            : false,
        persistent: false,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false))
    })
  }

  // ============================================
  // Device Information
  // ============================================

  getDeviceInfo(): DeviceInfo {
    return {
      platform: process.platform || 'unknown',
      arch: process.arch || 'unknown',
      memory: (window.performance as any)?.memory?.jsHeapSizeLimit || 0,
      cpus: navigator.hardwareConcurrency || 1,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    }
  }

  isOnline(): boolean {
    return navigator.onLine
  }

  // ============================================
  // Inter-plugin Communication
  // ============================================

  async callPlugin(targetPluginId: string, method: string, ...args: any[]): Promise<any> {
    // Check if target plugin is active
    const targetPlugin = this.manager.getPlugin(targetPluginId as PluginId)
    if (!targetPlugin || targetPlugin.state !== 'active') {
      throw new Error(`Plugin ${targetPluginId} is not active`)
    }

    // Emit event to target plugin
    return new Promise((resolve, reject) => {
      const responseEvent = `ipc-response:${Date.now()}`

      const timeout = setTimeout(() => {
        window.removeEventListener(responseEvent, handler)
        reject(new Error(`Plugin ${targetPluginId} did not respond`))
      }, 5000)

      const handler = (e: any) => {
        clearTimeout(timeout)
        window.removeEventListener(responseEvent, handler)
        if (e.detail.error) {
          reject(new Error(e.detail.error))
        } else {
          resolve(e.detail.result)
        }
      }

      window.addEventListener(responseEvent, handler)

      window.dispatchEvent(
        new CustomEvent(`plugin:${targetPluginId}:ipc`, {
          detail: {
            from: this.pluginId,
            method,
            args,
            responseEvent,
          },
        }),
      )
    })
  }

  // ============================================
  // Permissions
  // ============================================

  async requestPermission(permission: PluginPermission): Promise<boolean> {
    // In a real implementation, this would show a permission dialog
    // For now, we'll auto-grant most permissions except sensitive ones
    const sensitivePermissions: PluginPermission[] = [
      'file-system',
      'camera',
      'microphone',
      'location',
    ]

    if (sensitivePermissions.includes(permission)) {
      // Show permission request dialog
      const granted = await this.showDialog({
        title: 'Permission Request',
        message: `Plugin "${this.pluginId}" is requesting ${permission} permission. Allow?`,
        type: 'confirm',
      })

      if (granted) {
        this.grantedPermissions.add(permission)
      }
      return granted
    }

    // Auto-grant non-sensitive permissions
    this.grantedPermissions.add(permission)
    return true
  }

  hasPermission(permission: PluginPermission): boolean {
    return this.grantedPermissions.has(permission)
  }

  // ============================================
  // Cleanup
  // ============================================

  cleanup(): void {
    // Clear all event handlers
    this.eventHandlers.clear()

    // Clear granted permissions
    this.grantedPermissions.clear()
  }
}
