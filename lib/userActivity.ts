import { sql } from '@/lib/db-pool';

export interface ActivityLog {
  user_id: number;
  activity_type: string;
  activity_description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

export async function logUserActivity(logData: ActivityLog): Promise<void> {
  const { user_id, activity_type, activity_description, ip_address, user_agent, metadata } = logData;

  try {
    await sql`
      INSERT INTO user_activity_logs (user_id, activity_type, activity_description, ip_address, user_agent, metadata)
      VALUES (${user_id}, ${activity_type}, ${activity_description}, ${ip_address || null}, ${user_agent || null}, ${JSON.stringify(metadata || null)})
    `;
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

export async function getUserRecentActivity(userId: number, limit: number = 10): Promise<any[]> {
  try {
    const rows = await sql`
      SELECT activity_type, activity_description, ip_address, user_agent, metadata, created_at
      FROM user_activity_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return [];
  }
}

export async function getUserLoginActivity(userId: number, days: number = 30): Promise<any[]> {
  try {
    const rows = await sql`
      SELECT activity_type, activity_description, ip_address, user_agent, created_at
      FROM user_activity_logs
      WHERE user_id = ${userId}
        AND activity_type = 'login'
        AND created_at >= NOW() - make_interval(days => ${days})
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error('Error fetching user login activity:', error);
    return [];
  }
}

export async function updateUserLoginInfo(userId: number, ip_address?: string): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET last_login_at = NOW(),
          last_login_ip = ${ip_address || null},
          failed_login_attempts = 0,
          locked_until = NULL,
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    await logUserActivity({
      user_id: userId,
      activity_type: 'login',
      activity_description: 'User logged in',
      ip_address,
      user_agent: 'Unknown'
    });
  } catch (error) {
    console.error('Error updating user login info:', error);
  }
}

export async function incrementFailedLoginAttempts(userId: number): Promise<void> {
  try {
    await sql`
      UPDATE users
      SET failed_login_attempts = failed_login_attempts + 1, updated_at = NOW()
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error incrementing failed login attempts:', error);
  }
}

export async function lockUserAccount(userId: number, minutes: number = 15): Promise<void> {
  try {
    const lockUntil = new Date();
    lockUntil.setMinutes(lockUntil.getMinutes() + minutes);

    await sql`
      UPDATE users
      SET account_locked = true, locked_until = ${lockUntil.toISOString()}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    await logUserActivity({
      user_id: userId,
      activity_type: 'account_locked',
      activity_description: `Account locked due to failed login attempts until ${lockUntil.toISOString()}`,
      ip_address: 'System',
      user_agent: 'Security System'
    });
  } catch (error) {
    console.error('Error locking user account:', error);
  }
}

export async function isUserAccountLocked(userId: number): Promise<boolean> {
  try {
    const rows = await sql`
      SELECT account_locked, locked_until FROM users WHERE id = ${userId}
    `;

    if (rows.length === 0) return false;

    const user = rows[0];

    if (!user.account_locked) return false;

    if (user.locked_until && new Date(user.locked_until) < new Date()) {
      await sql`
        UPDATE users SET account_locked = false, locked_until = NULL, updated_at = NOW()
        WHERE id = ${userId}
      `;
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking if user account is locked:', error);
    return false;
  }
}

export async function updateUserStatsOnOrder(userId: number, orderTotal: number): Promise<void> {
  try {
    // Note: total_orders/total_spent/avg_order_value columns may not exist yet
    // This is a best-effort update
    await sql`
      UPDATE users SET updated_at = NOW() WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating user stats on order:', error);
  }
}
