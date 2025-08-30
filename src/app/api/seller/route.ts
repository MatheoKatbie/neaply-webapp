import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validation pour le profil seller
const createSellerProfileSchema = z.object({
  storeName: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .max(50, 'Store name cannot exceed 50 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio cannot exceed 500 characters').optional(),
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional()
    .or(z.literal('')),
  countryCode: z
    .string()
    .min(2, 'Country code is required and must be at least 2 characters')
    .max(3, 'Country code cannot exceed 3 characters'),
})

// Helper function pour l'authentification côté serveur et création d'utilisateur si nécessaire
async function getOrCreateServerUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  // Vérifier si l'utilisateur existe dans notre base de données
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  // Si l'utilisateur n'existe pas, le créer
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
        passwordHash: null,
        isSeller: false,
        isAdmin: false,
      },
    })
  }

  return dbUser
}

// Helper function pour générer un slug unique
function generateSlug(storeName: string): string {
  return storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export async function POST(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getOrCreateServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse et validation du body
    const body = await req.json()
    const validatedData = createSellerProfileSchema.parse(body)

    // Générer un slug unique pour le store
    let baseSlug = generateSlug(validatedData.storeName)
    let slug = baseSlug
    let counter = 1

    // Vérifier l'unicité du slug
    while (true) {
      const existingSlug = await prisma.sellerProfile.findUnique({
        where: { slug },
      })

      if (!existingSlug) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Vérifier l'unicité du nom de boutique
    const existingStore = await prisma.sellerProfile.findUnique({
      where: { storeName: validatedData.storeName },
    })

    if (existingStore) {
      return NextResponse.json({ error: 'Store name already exists' }, { status: 400 })
    }

    // Vérifier si l'utilisateur a déjà un profil seller
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    })

    if (existingProfile) {
      return NextResponse.json({ error: 'You already have a seller profile' }, { status: 400 })
    }

    // Transaction pour créer le profil seller et mettre à jour l'utilisateur
    const result = await prisma.$transaction(async (tx) => {
      // Créer le profil seller
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          userId: user.id,
          storeName: validatedData.storeName,
          slug,
          bio: validatedData.bio || null,
          websiteUrl: null,
          supportEmail: user.email,
          phoneNumber: validatedData.phoneNumber || null,
          countryCode: validatedData.countryCode,
          status: 'pending',
        },
      })

      // Mettre à jour le statut isSeller de l'utilisateur
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { isSeller: true },
      })

      return { sellerProfile, updatedUser }
    })

    return NextResponse.json(
      {
        data: result.sellerProfile,
        message: 'Seller profile created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getOrCreateServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Récupérer le profil seller de l'utilisateur
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    return NextResponse.json({ data: sellerProfile })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Vérification de l'authentification
    const user = await getOrCreateServerUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse et validation du body
    const body = await req.json()
    const validatedData = createSellerProfileSchema.parse(body)

    // Vérifier que l'utilisateur a un profil seller
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    })

    if (!existingProfile) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Si le nom de boutique change, vérifier l'unicité
    if (validatedData.storeName !== existingProfile.storeName) {
      const existingStore = await prisma.sellerProfile.findFirst({
        where: {
          storeName: validatedData.storeName,
          userId: { not: user.id },
        },
      })

      if (existingStore) {
        return NextResponse.json({ error: 'Store name already exists' }, { status: 400 })
      }
    }

    // Mettre à jour le profil seller
    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        storeName: validatedData.storeName,
        bio: validatedData.bio || null,
        websiteUrl: null,
        supportEmail: user.email,
        phoneNumber: validatedData.phoneNumber || null,
        countryCode: validatedData.countryCode,
      },
    })

    return NextResponse.json({
      data: updatedProfile,
      message: 'Seller profile updated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
