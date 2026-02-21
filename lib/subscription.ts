import { sql } from '@/lib/db-pool';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  interval_type: string;
  interval_count: number;
  trial_period_days: number;
  features?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  current_period_start?: Date;
  current_period_end?: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionOrder {
  id: number;
  subscription_id: number;
  order_id?: number;
  status: string;
  total_amount: number;
  items?: any;
  next_charge_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// Subscription Plans
export async function getSubscriptionPlans(activeOnly = true) {
  try {
    let rows;
    if (activeOnly) {
      rows = await sql`SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price`;
    } else {
      rows = await sql`SELECT * FROM subscription_plans ORDER BY price`;
    }
    return { success: true, plans: rows as SubscriptionPlan[] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getSubscriptionPlanById(id: number) {
  try {
    const rows = await sql`SELECT * FROM subscription_plans WHERE id = ${id}`;
    return { success: true, plan: rows[0] as SubscriptionPlan };
  } catch (error) {
    return { success: false, error };
  }
}

export async function createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const rows = await sql`
      INSERT INTO subscription_plans (name, description, price, interval_type, interval_count, trial_period_days, features, is_active)
      VALUES (${plan.name}, ${plan.description}, ${plan.price}, ${plan.interval_type}, ${plan.interval_count}, ${plan.trial_period_days}, ${JSON.stringify(plan.features || null)}, ${plan.is_active})
      RETURNING *
    `;
    return { success: true, plan: rows[0] as SubscriptionPlan };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateSubscriptionPlan(id: number, updates: Partial<SubscriptionPlan>) {
  try {
    const rows = await sql`
      UPDATE subscription_plans SET
        name = COALESCE(${updates.name ?? null}, name),
        description = COALESCE(${updates.description ?? null}, description),
        price = COALESCE(${updates.price ?? null}, price),
        interval_type = COALESCE(${updates.interval_type ?? null}, interval_type),
        interval_count = COALESCE(${updates.interval_count ?? null}, interval_count),
        trial_period_days = COALESCE(${updates.trial_period_days ?? null}, trial_period_days),
        features = COALESCE(${updates.features !== undefined ? JSON.stringify(updates.features) : null}, features),
        is_active = COALESCE(${updates.is_active ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return { success: true, plan: rows[0] as SubscriptionPlan };
  } catch (error) {
    return { success: false, error };
  }
}

export async function deleteSubscriptionPlan(id: number) {
  try {
    const rows = await sql`
      UPDATE subscription_plans SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) {
      return { success: false, error: 'Subscription plan not found' };
    }
    return { success: true, plan: rows[0] as SubscriptionPlan };
  } catch (error) {
    return { success: false, error };
  }
}

// Subscriptions
export async function getUserSubscription(userId: number) {
  try {
    const rows = await sql`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description, sp.price as plan_price
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ${userId} AND s.status IN ('active', 'trialing', 'past_due')
      ORDER BY s.created_at DESC
      LIMIT 1
    `;
    return { success: true, subscription: rows[0] as Subscription };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getUserSubscriptions(userId: number) {
  try {
    const rows = await sql`
      SELECT s.*, sp.name as plan_name, sp.description as plan_description, sp.price as plan_price
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
    `;
    return { success: true, subscriptions: rows as Subscription[] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const rows = await sql`
      INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end, trial_start, trial_end)
      VALUES (${subscription.user_id}, ${subscription.plan_id}, ${subscription.status}, ${subscription.current_period_start || null}, ${subscription.current_period_end || null}, ${subscription.trial_start || null}, ${subscription.trial_end || null})
      RETURNING *
    `;
    return { success: true, subscription: rows[0] as Subscription };
  } catch (error) {
    return { success: false, error };
  }
}

export async function updateSubscription(id: number, updates: Partial<Subscription>) {
  try {
    const rows = await sql`
      UPDATE subscriptions SET
        status = COALESCE(${updates.status ?? null}, status),
        current_period_start = COALESCE(${updates.current_period_start ?? null}, current_period_start),
        current_period_end = COALESCE(${updates.current_period_end ?? null}, current_period_end),
        trial_start = COALESCE(${updates.trial_start ?? null}, trial_start),
        trial_end = COALESCE(${updates.trial_end ?? null}, trial_end),
        cancel_at_period_end = COALESCE(${updates.cancel_at_period_end ?? null}, cancel_at_period_end),
        cancelled_at = COALESCE(${updates.cancelled_at ?? null}, cancelled_at),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return { success: true, subscription: rows[0] as Subscription };
  } catch (error) {
    return { success: false, error };
  }
}

// Subscription Orders
export async function getSubscriptionOrders(subscriptionId: number) {
  try {
    const rows = await sql`
      SELECT * FROM subscription_orders
      WHERE subscription_id = ${subscriptionId}
      ORDER BY created_at DESC
    `;
    return { success: true, orders: rows as SubscriptionOrder[] };
  } catch (error) {
    return { success: false, error };
  }
}

export async function createSubscriptionOrder(order: Omit<SubscriptionOrder, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const rows = await sql`
      INSERT INTO subscription_orders (subscription_id, order_id, status, total_amount, items, next_charge_date)
      VALUES (${order.subscription_id}, ${order.order_id || null}, ${order.status}, ${order.total_amount}, ${JSON.stringify(order.items || null)}, ${order.next_charge_date || null})
      RETURNING *
    `;
    return { success: true, order: rows[0] as SubscriptionOrder };
  } catch (error) {
    return { success: false, error };
  }
}
