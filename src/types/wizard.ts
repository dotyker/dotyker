export type StandaloneWizardStage =
  | 'selectDeviceMode'
  | 'websitePage'
  | 'mediaSlideshow'
  | 'pluginMarketplace'

export type ValidationRule = (val: string | null) => boolean | string

export interface ComponentProps {
  name: string
  darkMode: boolean
}

export interface ComponentEmits {
  'update:name': [name: string]
}
