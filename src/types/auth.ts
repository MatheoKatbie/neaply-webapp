export interface AuthUser {
    id: string
    email: string
    name?: string
    avatar_url?: string
    isSeller: boolean
    isAdmin: boolean
    displayName: string
    createdAt?: Date
    updatedAt?: Date
}

export interface LoginFormData {
    email: string
    password: string
}

export interface RegisterFormData {
    email: string
    password: string
    confirmPassword: string
    name: string
}

export interface AuthState {
    user: AuthUser | null
    loading: boolean
    error: string | null
}

export type AuthProvider = 'google' | 'github' | 'discord'
