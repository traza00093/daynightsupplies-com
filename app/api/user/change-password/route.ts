import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db-pool';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id && !session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current password and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ message: 'New password must be at least 8 characters long' }, { status: 400 });
        }

        let users;
        if (session.user.id) {
            users = await sql`SELECT id, password_hash FROM users WHERE id = ${parseInt(session.user.id)} LIMIT 1`;
        } else {
            users = await sql`SELECT id, password_hash FROM users WHERE email = ${session.user.email} LIMIT 1`;
        }

        if (users.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        if (!user.password_hash) {
            return NextResponse.json({ message: 'No password set for this account' }, { status: 400 });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await sql`UPDATE users SET password_hash = ${hashedPassword}, updated_at = NOW() WHERE id = ${user.id}`;

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json({ message: 'Failed to change password' }, { status: 500 });
    }
}
