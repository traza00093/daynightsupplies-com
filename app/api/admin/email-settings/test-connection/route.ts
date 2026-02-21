import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
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

    if (!emailSettings) {
      return new Response(JSON.stringify({ error: 'Email settings are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Create transporter with provided settings
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_secure,
      auth: {
        user: emailSettings.smtp_user,
        pass: emailSettings.smtp_pass
      }
    })

    // Test the connection
    await transporter.verify()

    return new Response(JSON.stringify({ success: true, message: 'SMTP connection successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('SMTP connection test error:', error)
    
    let errorMessage = 'SMTP connection failed'
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your username and password.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Check your host and port settings.'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out. Check your network and firewall settings.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}