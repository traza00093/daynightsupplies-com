import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getEmailSettings, updateEmailSettings } from '@/lib/db'
import { ensureDatabaseInitialized } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseInitialized()
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await getEmailSettings()
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve email settings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ emailSettings: result.settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching email settings:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.isAdmin) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    const { emailSettings } = body

    // Validate required fields
    if (!emailSettings) {
      return new Response(JSON.stringify({ error: 'Email settings are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await updateEmailSettings(emailSettings)
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Failed to update email settings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating email settings:', error)
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}