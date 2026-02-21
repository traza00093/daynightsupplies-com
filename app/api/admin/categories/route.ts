import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db-init'
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    await ensureDatabaseInitialized()
    const result = await getCategories()
    if (result.success) {
      return createAdminResponse({ categories: result.categories })
    } else {
      return createErrorResponse('Failed to fetch categories')
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return createErrorResponse('Internal server error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    const result = await createCategory(body)

    if (result.success) {
      return createAdminResponse({ category: result.category })
    } else {
      return createErrorResponse('Failed to create category')
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return createErrorResponse('Invalid request body', 400)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    const { id, ...categoryData } = body
    const result = await updateCategory(id, categoryData)

    if (result.success) {
      return createAdminResponse({ category: result.category })
    } else {
      return createErrorResponse('Failed to update category')
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return createErrorResponse('Invalid request body', 400)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return createErrorResponse('Category ID required', 400)
    }

    const result = await deleteCategory(id)

    if (result.success) {
      return createAdminResponse({ message: 'Category deleted successfully' })
    } else {
      return createErrorResponse('Failed to delete category')
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return createErrorResponse('Invalid request', 400)
  }
}
