import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getEmailSettings } from '@/lib/db'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address required' }, { status: 400 })
    }

    const settingsResult = await getEmailSettings()
    if (!settingsResult.success || !settingsResult.emailSettings) {
      return NextResponse.json({ error: 'Failed to get email settings' }, { status: 500 })
    }

    const emailSettings = settingsResult.emailSettings

    const transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_secure,
      auth: {
        user: emailSettings.smtp_user,
        pass: emailSettings.smtp_pass
      }
    })

    await transporter.sendMail({
      from: `"${emailSettings.email_from_name}" <${emailSettings.sender_email || emailSettings.smtp_user}>`,
      to: testEmail,
      subject: `Test Email from ${emailSettings.email_from_name || 'Store'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email from your store's email configuration.</p>
          <p>If you received this email, your SMTP settings are configured correctly.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true, message: 'Test email sent successfully' })
  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ error: 'Failed to send test email', details: String(error) }, { status: 500 })
  }
}
