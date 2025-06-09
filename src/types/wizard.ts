export type AppType =
  | 'multiApp'
  | 'singleApp'
  | 'publicBrowser'
  | 'staticApp'
  | 'webPlaylist'
  | 'mediaPlaylist'

export interface ToggleOption {
  value: AppType
  label: string
}

export type ValidationRule = (val: string | null) => boolean | string

export interface WizardFormData {
  type: AppType
  name: string
  darkMode: boolean
}

export interface ComponentProps {
  name: string
  darkMode: boolean
}

export interface ComponentEmits {
  'update:name': [name: string]
}
