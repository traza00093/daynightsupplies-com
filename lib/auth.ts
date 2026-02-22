import { NextAuthOptions } from 'next-auth';
import { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

function buildDatabaseUrl() {
  const dbUser = process.env.PGUSER;
  const dbHost = process.env.PGHOST;
  const dbPassword = process.env.PGPASSWORD;
  const dbName = process.env.PGDATABASE;
  if (!dbUser || !dbHost || !dbPassword || !dbName) {
    throw new Error('Missing required PostgreSQL environment variables for auth');
  }
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}/${dbName}?sslmode=require`;
}

let sql: NeonQueryFunction<false, false>;

function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || buildDatabaseUrl();
    sql = neon(databaseUrl);
  }
  return sql;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const sql = getDb();
          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1
          `;

          if (users.length === 0) {
            return null;
          }

          const user = users[0];

          if (!user.password_hash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            isAdmin: user.account_type === 'admin'
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
