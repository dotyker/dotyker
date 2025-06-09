const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SUFFIX_LENGTH = 7
const DEVICE_PREFIX = 'DOTYKER'

export const useDeviceNameGenerator = () => {
  const generateRandomSuffix = (length: number = SUFFIX_LENGTH): string => {
    return Array.from({ length }, () =>
      CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length)),
    ).join('')
  }

  const generateRandomDeviceName = (prefix: string = DEVICE_PREFIX): string => {
    const randomSuffix = generateRandomSuffix()
    return `${prefix}-${randomSuffix}`
  }

  return {
    generateRandomDeviceName,
    generateRandomSuffix,
  }
}
