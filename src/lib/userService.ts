export interface DatabaseUser {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  isSeller: boolean
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Récupère ou crée un utilisateur dans la base de données via l'API route
 */
export async function getOrCreateUser(
  supabaseUserId: string,
  email: string,
  displayName?: string,
  avatarUrl?: string
): Promise<DatabaseUser | null> {
  try {
    const response = await fetch('/api/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error("Erreur lors de la récupération de l'utilisateur:", response.statusText)
      return null
    }

    const userData = await response.json()

    return {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      avatarUrl: userData.avatarUrl,
      isSeller: userData.isSeller,
      isAdmin: userData.isAdmin,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    }
  } catch (error) {
    console.error('Erreur lors de getOrCreateUser:', error)
    return null
  }
}

/**
 * Met à jour les données utilisateur dans la base de données via l'API route
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<DatabaseUser, 'displayName' | 'avatarUrl' | 'isSeller'>>
): Promise<DatabaseUser | null> {
  try {
    const response = await fetch('/api/user', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", response.statusText)
      return null
    }

    const userData = await response.json()

    return {
      id: userData.id,
      email: userData.email,
      displayName: userData.displayName,
      avatarUrl: userData.avatarUrl,
      isSeller: userData.isSeller,
      isAdmin: userData.isAdmin,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    }
  } catch (error) {
    console.error('Erreur lors de updateUser:', error)
    return null
  }
}
