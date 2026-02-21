import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  checkDatabaseStatus,
  runSchemaMigration,
  createFirstAdmin,
  validateSetupSecret,
} from '@/lib/setup';

const setupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a digit')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    setupSecret: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten();
      return NextResponse.json(
        { error: 'Validation failed', details: errors.fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, setupSecret } = parsed.data;

    // Check setup secret
    if (!validateSetupSecret(setupSecret)) {
      return NextResponse.json(
        { error: 'Invalid setup secret' },
        { status: 403 }
      );
    }

    // Check if admin already exists
    const status = await checkDatabaseStatus();
    if (status.adminExists) {
      return NextResponse.json(
        { error: 'An admin user already exists. Setup is no longer available.' },
        { status: 409 }
      );
    }

    // Always run migrations when no admin exists — all statements use IF NOT EXISTS
    // so this is idempotent and handles partial migration recovery.
    const migration = await runSchemaMigration();
    if (!migration.success) {
      return NextResponse.json(
        { error: migration.error },
        { status: 500 }
      );
    }

    // Create admin user
    const result = await createFirstAdmin({ email, password, firstName, lastName });
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'An admin user already exists' ? 409 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Setup failed. Please try again.' },
      { status: 500 }
    );
  }
}
