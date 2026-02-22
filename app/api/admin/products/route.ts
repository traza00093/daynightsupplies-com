import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/db'
import { validateAdminAccess, createAdminResponse, createErrorResponse } from '@/lib/admin-auth'
import { ensureDatabaseInitialized } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '50')
    await ensureDatabaseInitialized()
    const result = await getProducts(limit, 0, categoryId || undefined)

    if (result.success) {
      return createAdminResponse({ products: result.products })
    } else {
      return createErrorResponse('Failed to fetch products')
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return createErrorResponse('Internal server error')
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/products - Request received')

    const authResult = await validateAdminAccess(request)
    console.log('Auth result:', authResult)

    if (!authResult.authorized) {
      console.log('Unauthorized:', authResult.error)
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    console.log('Product data received:', JSON.stringify(body, null, 2))

    const result = await createProduct(body)
    console.log('Create product result:', result)

    if (result.success) {
      return createAdminResponse({ product: result.product }, 201)
    } else {
      console.error('Failed to create product:', result.error)
      return createErrorResponse(result.error?.toString() || 'Failed to create product', 500)
    }
  } catch (error) {
    console.error('Error creating product - EXCEPTION:', error)
    return createErrorResponse(`Error: ${error}`, 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAdminAccess(request)
    if (!authResult.authorized) {
      return createErrorResponse(authResult.error!, authResult.status)
    }

    const body = await request.json()
    const { id, ...productData } = body
    const result = await updateProduct(id, productData)

    if (result.success) {
      return createAdminResponse({ product: result.product })
    } else {
      return createErrorResponse('Failed to update product')
    }
  } catch (error) {
    console.error('Error updating product:', error)
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
      return createErrorResponse('Product ID required', 400)
    }

    const result = await deleteProduct(id)

    if (result.success) {
      return createAdminResponse({ message: 'Product deleted successfully' })
    } else {
      return createErrorResponse('Failed to delete product')
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return createErrorResponse('Invalid request', 400)
  }
}
