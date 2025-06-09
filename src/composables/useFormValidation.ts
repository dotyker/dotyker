import type { ValidationRule } from 'types/wizard'

export const useFormValidation = () => {
  const nameValidationRules: ValidationRule[] = [
    (val: string | null) => {
      if (!val || val.length === 0) {
        return 'Please type something'
      }
      return true
    },
    (val: string | null) => {
      if (val && val.length > 50) {
        return 'Name must be less than 50 characters'
      }
      return true
    },
    (val: string | null) => {
      if (val && !/^[a-zA-Z0-9-_\s]+$/.test(val)) {
        return 'Name can only contain letters, numbers, hyphens, underscores, and spaces'
      }
      return true
    },
  ]

  const validateName = (name: string): boolean => {
    return nameValidationRules.every((rule) => rule(name) === true)
  }

  return {
    nameValidationRules,
    validateName,
  }
}
