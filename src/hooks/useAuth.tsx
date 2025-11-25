'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getOrCreateUser, type DatabaseUser } from '@/lib/userService'
import type { AuthUser, LoginFormData, RegisterFormData, AuthProvider } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (data: LoginFormData) => Promise<{ error?: string }>
  signUp: (data: RegisterFormData) => Promise<{ error?: string }>
  signInWithProvider: (provider: AuthProvider) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const authUser = await mapSupabaseUserToAuthUser(session.user)
        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        const authUser = await mapSupabaseUserToAuthUser(session.user)
        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Helper function to detect authentication provider
  const detectAuthProvider = (user: User): 'email' | 'google' | 'github' | 'discord' => {
    // Check user identities to determine the provider
    if (user.identities && user.identities.length > 0) {
      // Get the provider from the first identity (primary auth method)
      const provider = user.identities[0].provider
      if (provider === 'google' || provider === 'github' || provider === 'discord') {
        return provider
      }
    }
    // Default to email if no OAuth provider found
    return 'email'
  }

  const mapSupabaseUserToAuthUser = async (user: User): Promise<AuthUser> => {
    // Récupérer les données utilisateur depuis notre API pour avoir les informations à jour
    try {
      const response = await fetch('/api/user', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: inclure les cookies
      })

      if (response.ok) {
        const userData = await response.json()
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: userData.avatarUrl || user.user_metadata?.avatar_url,
          isSeller: userData.isSeller || false,
          isAdmin: userData.isAdmin || false,
          displayName:
            userData.displayName ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email!.split('@')[0],
          createdAt: user.created_at ? new Date(user.created_at) : undefined,
          updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
          authProvider: detectAuthProvider(user),
        }
      } else {
        console.log('Failed to fetch user data from API, status:', response.status)
        // Si on a une erreur 401, essayer de rafraîchir la session
        if (response.status === 401) {
          console.log('Session expired, attempting to refresh...')
          const {
            data: { session },
            error,
          } = await supabase.auth.refreshSession()
          if (session && !error) {
            console.log('Session refreshed successfully')
            // Retenter la requête après rafraîchissement
            const retryResponse = await fetch('/api/user', {
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            })
            if (retryResponse.ok) {
              const userData = await retryResponse.json()
              return {
                id: user.id,
                email: user.email!,
                name: user.user_metadata?.full_name || user.user_metadata?.name,
                avatar_url: userData.avatarUrl || user.user_metadata?.avatar_url,
                isSeller: userData.isSeller || false,
                isAdmin: userData.isAdmin || false,
                displayName:
                  userData.displayName ||
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email!.split('@')[0],
                createdAt: user.created_at ? new Date(user.created_at) : undefined,
                updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
                authProvider: detectAuthProvider(user),
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Network error when fetching user data from API:', error)
    }

    // Fallback aux user_metadata en cas d'erreur
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      isSeller: user.user_metadata?.isSeller || false,
      isAdmin: user.user_metadata?.isAdmin || false,
      displayName:
        user.user_metadata?.displayName ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email!.split('@')[0],
      createdAt: user.created_at ? new Date(user.created_at) : undefined,
      updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      authProvider: detectAuthProvider(user),
    }
  }

  const signIn = async (data: LoginFormData) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      return { error: error.message }
    }
    return {}
  }

  const signUp = async (data: RegisterFormData) => {
    setError(null)
    if (data.password !== data.confirmPassword) {
      const errorMsg = 'Les mots de passe ne correspondent pas'
      setError(errorMsg)
      return { error: errorMsg }
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    })

    if (error) {
      setError(error.message)
      return { error: error.message }
    }
    return {}
  }

  const signInWithProvider = async (provider: AuthProvider) => {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      return { error: error.message }
    }
    return {}
  }

  const signOut = async () => {
    setError(null)
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      return { error: error.message }
    }
    return {}
  }

  const refreshUser = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser) {
      const authUser = await mapSupabaseUserToAuthUser(currentUser)
      setUser(authUser)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    resetPassword,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
