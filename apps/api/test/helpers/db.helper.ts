import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

export type DrizzleDB = ReturnType<typeof drizzle>;

/**
 * Transactional test helper for database integration tests.
 *
 * Usage:
 *   describe('MyService', () => {
 *     let db: DrizzleDB;
 *     let sql: Sql;
 *
 *     beforeAll(async () => {
 *       ({ db, sql } = await createTestDb());
 *     });
 *
 *     afterAll(async () => {
 *       await closeTestDb(sql);
 *     });
 *
 *     test('inserts a user', async () => {
 *       await db.insert(schema.users).values({ ... }).execute();
 *       // After test completes, transaction rolls back automatically
 *     });
 *   });
 */

export type TestDb = {
  db: DrizzleDB;
  sql: Sql;
};

/**
 * Creates a database connection for testing.
 * Tests should use the DATABASE_URL env var pointing to a test database.
 */
export async function createTestDb(): Promise<TestDb> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Tests require a test database.',
    );
  }

  const sql = postgres(connectionString, {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 5,
  });

  const db = drizzle(sql) as unknown as DrizzleDB;

  return { db, sql };
}

/**
 * Closes the test database connection.
 */
export async function closeTestDb(sql: Sql): Promise<void> {
  await sql.end();
}

/**
 * Wraps each test in a database transaction that rolls back after the test.
 * This ensures test isolation — no data persists between tests.
 *
 * Usage inside describe block:
 *   beforeEach(async () => await beginTransaction(sql));
 *   afterEach(async () => await rollbackTransaction(sql));
 */
export async function beginTransaction(sql: Sql): Promise<void> {
  await sql`BEGIN`;
}

export async function rollbackTransaction(sql: Sql): Promise<void> {
  await sql`ROLLBACK`;
}

/**
 * Clears all data from all tables (useful for seeding tests).
 * Truncates in dependency-safe order.
 */
export async function clearAllTables(sql: Sql): Promise<void> {
  // Disable foreign key checks temporarily
  await sql`SET session_replication_role = 'replica'`;

  const tables = [
    'institution_enrollments',
    'institution_accounts',
    'audit_logs',
    'beta_invites',
    'submissions',
    'assignments',
    'progress',
    'reviews',
    'notifications',
    'messages',
    'channels',
    'live_classes',
    'lectures',
    'sections',
    'certificates',
    'payments',
    'enrollments',
    'courses',
    'password_resets',
    'email_verifications',
    'user_auth_providers',
    'admin_profiles',
    'instructor_profiles',
    'student_profiles',
    'users',
    'jobs',
    'waitlist',
  ];

  for (const table of tables) {
    await sql`TRUNCATE TABLE ${sql(table)} CASCADE`;
  }

  // Re-enable foreign key checks
  await sql`SET session_replication_role = 'origin'`;
}

/**
 * Seeds a minimal set of test data into the database.
 */
export async function seedTestData(sql: Sql): Promise<{
  adminUser: any;
  instructorUser: any;
  studentUser: any;
  course: any;
}> {
  const [adminUser] = await sql`
    INSERT INTO users (email, password_hash, role, name, is_verified, is_active)
    VALUES ('admin@edutech.test', '$2b$12$hashedpassword', 'admin', 'Test Admin', true, true)
    RETURNING *
  `;

  const [instructorUser] = await sql`
    INSERT INTO users (email, password_hash, role, name, is_verified, is_active)
    VALUES ('instructor@edutech.test', '$2b$12$hashedpassword', 'instructor', 'Test Instructor', true, true)
    RETURNING *
  `;

  const [studentUser] = await sql`
    INSERT INTO users (email, password_hash, role, name, is_verified, is_active)
    VALUES ('student@edutech.test', '$2b$12$hashedpassword', 'student', 'Test Student', true, true)
    RETURNING *
  `;

  const [course] = await sql`
    INSERT INTO courses (instructor_id, title, description, domain, pricing_type, price_inr, is_published)
    VALUES (${instructorUser.id}, 'Test Course', 'A test course', 'Programming', 'free', 0, true)
    RETURNING *
  `;

  return { adminUser, instructorUser, studentUser, course };
}
