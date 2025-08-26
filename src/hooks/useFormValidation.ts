import { useCallback, useMemo, useState } from 'react'

// Validation rules based on Zod schema from API
type ValidationRule =
    | { minLength: number; maxLength: number; required: boolean }
    | { min: number; max: number; required: boolean }
    | { required: boolean }
    | { minArrayLength: number; required: boolean }

const validationRules: Record<string, ValidationRule> = {
    title: {
        minLength: 3,
        maxLength: 100,
        required: true,
    },
    shortDesc: {
        minLength: 10,
        maxLength: 200,
        required: true,
    },
    longDescMd: {
        minLength: 50,
        maxLength: 5000,
        required: false,
    },
    basePriceCents: {
        min: 0, // €0.00 (free)
        max: 100000, // €1000.00
        required: true,
    },
    platform: {
        required: true,
    },
    jsonContent: {
        required: true,
    },
    documentationUrl: {
        required: true,
    },
    n8nMinVersion: {
        required: false, // Will be validated conditionally based on platform
    },
    n8nMaxVersion: {
        required: false,
    },
    zapierMinVersion: {
        required: false, // Will be validated conditionally based on platform
    },
    zapierMaxVersion: {
        required: false,
    },
    makeMinVersion: {
        required: false, // Will be validated conditionally based on platform
    },
    makeMaxVersion: {
        required: false,
    },
    airtableScriptMinVersion: {
        required: false, // Will be validated conditionally based on platform
    },
    airtableScriptMaxVersion: {
        required: false,
    },
    categoryIds: {
        minArrayLength: 1,
        required: true,
    },
    tagIds: {
        minArrayLength: 1,
        required: true,
    },
}

// Field name mapping for better error messages
const fieldNames: Record<string, string> = {
    title: 'Title',
    shortDesc: 'Short description',
    longDescMd: 'Detailed description',
    basePriceCents: 'Price',
    platform: 'Platform',
    jsonContent: 'Workflow JSON',
    documentationUrl: 'Documentation',
    n8nMinVersion: 'Minimum n8n version',
    n8nMaxVersion: 'Maximum n8n version',
    zapierMinVersion: 'Minimum Zapier version',
    zapierMaxVersion: 'Maximum Zapier version',
    makeMinVersion: 'Minimum Make version',
    makeMaxVersion: 'Maximum Make version',
    airtableScriptMinVersion: 'Minimum Airtable Script version',
    airtableScriptMaxVersion: 'Maximum Airtable Script version',
    categoryIds: 'Categories',
    tagIds: 'Tags',
}

interface WorkflowFormData {
    title: string
    shortDesc: string
    longDescMd: string
    heroImageUrl: string
    heroImageFile?: File
    documentationUrl: string
    documentationFile?: File
    basePriceCents: number
    currency: string
    status: 'draft' | 'published' | 'unlisted' | 'disabled' | 'pack_only'
    platform?: string
    jsonContent?: any
    jsonFile?: File
    n8nMinVersion?: string
    n8nMaxVersion?: string
    zapierMinVersion?: string
    zapierMaxVersion?: string
    makeMinVersion?: string
    makeMaxVersion?: string
    airtableScriptMinVersion?: string
    airtableScriptMaxVersion?: string
    categoryIds?: string[]
    tagIds?: string[]
}

export const useFormValidation = (formData: WorkflowFormData) => {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const validateField = useCallback(
        (field: string, value: any): string | null => {
            const rules = validationRules[field as keyof typeof validationRules]
            if (!rules) return null

            const fieldName = fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1)

            if (rules.required && (value === undefined || value === null || (typeof value === 'string' && !value.trim()))) {
                return `${fieldName} is required`
            }

            if (typeof value === 'string' && value.trim()) {
                if ('minLength' in rules && value.length < rules.minLength) {
                    return `${fieldName} must be at least ${rules.minLength} characters`
                }
                if ('maxLength' in rules && value.length > rules.maxLength) {
                    return `${fieldName} cannot exceed ${rules.maxLength} characters`
                }
            }

            if (field === 'basePriceCents' && typeof value === 'number') {
                if ('min' in rules && value < rules.min) {
                    return `Price cannot be negative`
                }
                if ('max' in rules && value > rules.max) {
                    return `Price cannot exceed €${(rules.max / 100).toFixed(2)}`
                }
            }

            if (field === 'jsonContent' && rules.required && !value) {
                return 'Workflow JSON is required'
            }

            if (field === 'documentationUrl' && rules.required) {
                // Check if we have either a URL or a selected file
                const hasUrl = value && value.trim() && !value.startsWith('blob:')
                const hasSelectedFile = formData.documentationFile
                if (!hasUrl && !hasSelectedFile) {
                    return 'Documentation is required'
                }
                // If we have a blob URL, we must have a selected file
                if (value && value.startsWith('blob:') && !hasSelectedFile) {
                    return 'Documentation is required'
                }
                // If we have a valid URL (not blob), it's considered valid
                if (hasUrl) {
                    return null
                }
            }

            if (field === 'n8nMinVersion' && rules.required && !value) {
                // Only validate n8n version if n8n is the selected platform
                if (formData.platform === 'n8n') {
                    return 'Minimum n8n version is required'
                }
            }

            if (field === 'n8nMinVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'n8nMaxVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'n8nMaxVersion' && value && value.trim()) {
                const minVersion = formData.n8nMinVersion || '0.0.0'
                const maxVersion = value

                // Compare semantic versions properly
                const minParts = minVersion.split('.').map(Number)
                const maxParts = maxVersion.split('.').map(Number)

                // Pad arrays to same length
                while (minParts.length < maxParts.length) minParts.push(0)
                while (maxParts.length < minParts.length) maxParts.push(0)

                // Compare each part
                for (let i = 0; i < minParts.length; i++) {
                    if (maxParts[i] > minParts[i]) break
                    if (maxParts[i] < minParts[i]) {
                        return 'Maximum n8n version must be greater than minimum n8n version'
                    }
                }
            }

            if (field === 'zapierMinVersion' && rules.required && !value) {
                // Only validate Zapier version if Zapier is the selected platform
                if (formData.platform === 'zapier') {
                    return 'Minimum Zapier version is required'
                }
            }

            if (field === 'zapierMinVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'zapierMaxVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'zapierMaxVersion' && value && value.trim()) {
                const minVersion = formData.zapierMinVersion || '0.0.0'
                const maxVersion = value

                // Compare semantic versions properly
                const minParts = minVersion.split('.').map(Number)
                const maxParts = maxVersion.split('.').map(Number)

                // Pad arrays to same length
                while (minParts.length < maxParts.length) minParts.push(0)
                while (maxParts.length < minParts.length) maxParts.push(0)

                // Compare each part
                for (let i = 0; i < minParts.length; i++) {
                    if (maxParts[i] > minParts[i]) break
                    if (maxParts[i] < minParts[i]) {
                        return 'Maximum Zapier version must be greater than minimum Zapier version'
                    }
                }
            }

            if (field === 'makeMinVersion' && rules.required && !value) {
                // Only validate Make version if Make is the selected platform
                if (formData.platform === 'make') {
                    return 'Minimum Make version is required'
                }
            }

            if (field === 'makeMinVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'makeMaxVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'makeMaxVersion' && value && value.trim()) {
                const minVersion = formData.makeMinVersion || '0.0.0'
                const maxVersion = value

                // Compare semantic versions properly
                const minParts = minVersion.split('.').map(Number)
                const maxParts = maxVersion.split('.').map(Number)

                // Pad arrays to same length
                while (minParts.length < maxParts.length) minParts.push(0)
                while (maxParts.length < minParts.length) maxParts.push(0)

                // Compare each part
                for (let i = 0; i < minParts.length; i++) {
                    if (maxParts[i] > minParts[i]) break
                    if (maxParts[i] < minParts[i]) {
                        return 'Maximum Make version must be greater than minimum Make version'
                    }
                }
            }

            if (field === 'airtableScriptMinVersion' && rules.required && !value) {
                // Only validate Airtable Script version if Airtable Script is the selected platform
                if (formData.platform === 'airtable_script') {
                    return 'Minimum Airtable Script version is required'
                }
            }

            if (field === 'airtableScriptMinVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'airtableScriptMaxVersion' && value && value.trim()) {
                const versionRegex = /^\d+\.\d+\.\d+$/
                if (!versionRegex.test(value)) {
                    return 'Version must be in format X.Y.Z (e.g., 1.0.0)'
                }
            }

            if (field === 'airtableScriptMaxVersion' && value && value.trim()) {
                const minVersion = formData.airtableScriptMinVersion || '0.0.0'
                const maxVersion = value

                // Compare semantic versions properly
                const minParts = minVersion.split('.').map(Number)
                const maxParts = maxVersion.split('.').map(Number)

                // Pad arrays to same length
                while (minParts.length < maxParts.length) minParts.push(0)
                while (maxParts.length < minParts.length) maxParts.push(0)

                // Compare each part
                for (let i = 0; i < minParts.length; i++) {
                    if (maxParts[i] > minParts[i]) break
                    if (maxParts[i] < minParts[i]) {
                        return 'Maximum Airtable Script version must be greater than minimum Airtable Script version'
                    }
                }
            }

            // Validate array fields (categories and tags)
            if (Array.isArray(value)) {
                if ('minArrayLength' in rules && value.length < rules.minArrayLength) {
                    return `${fieldName} must have at least ${rules.minArrayLength} selection`
                }
            }

            return null
        },
        [formData]
    )

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {}

        Object.keys(validationRules).forEach((field) => {
            const value = formData[field as keyof WorkflowFormData]
            const error = validateField(field, value)
            if (error) {
                newErrors[field] = error
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [formData, validateField])

    const markFieldAsTouched = useCallback((field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
    }, [])

    const getFieldError = useCallback(
        (field: string): string | null => {
            if (!touched[field]) return null
            return errors[field] || null
        },
        [errors, touched]
    )

    // Reset touched state when opening create form
    const resetTouchedState = useCallback(() => {
        setTouched({})
    }, [])

    const isFormValid = useMemo(() => {
        return validateForm()
    }, [validateForm])

    return {
        errors,
        touched,
        validateField,
        validateForm,
        markFieldAsTouched,
        getFieldError,
        isFormValid,
        resetTouchedState,
    }
}

export type { WorkflowFormData }
