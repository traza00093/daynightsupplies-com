import { sql } from '@/lib/db-pool';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const chats = await sql`SELECT * FROM support_chats WHERE user_id = ${parseInt(userId)} ORDER BY created_at DESC`;
      return NextResponse.json({ chats });
    }

    const chats = await sql`SELECT * FROM support_chats WHERE status = 'active' ORDER BY created_at DESC`;

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Support chat fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, sessionId, message, senderType } = await request.json();

    if (action === 'create') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      const newSessionId = `chat_${Date.now()}_${userId}`;

      const rows = await sql`INSERT INTO support_chats (user_id, session_id) VALUES (${userId}, ${newSessionId}) RETURNING *`;

      return NextResponse.json({ success: true, chat: rows[0] });
    }

    if (action === 'message') {
      if (!sessionId || !message || !senderType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const chatRows = await sql`SELECT id FROM support_chats WHERE session_id = ${sessionId}`;

      if (chatRows.length === 0) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      const rows = await sql`INSERT INTO chat_messages (chat_id, sender_type, message) VALUES (${chatRows[0].id}, ${senderType}, ${message}) RETURNING *`;

      return NextResponse.json({ success: true, message: rows[0] });
    }

    if (action === 'close') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
      }

      await sql`UPDATE support_chats SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE session_id = ${sessionId}`;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Support chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
