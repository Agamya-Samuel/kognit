import postgres from "postgres";
import bcrypt from "bcrypt";

const args = process.argv.slice(2);

function printUsage() {
  console.log(`
Usage: npx ts-node scripts/add-user.ts <email> <password> <name> <role>

Arguments:
  email     - User's email address (required)
  password  - User's password (required)
  name      - User's display name (required)
  role      - User role: admin, instructor, or student (required)

Examples:
  npx tsx add-user.ts admin@school.edu password123 "School Admin" admin
  npx tsx add-user.ts teacher@school.edu password123 "John Teacher" instructor
  npx tsx add-user.ts student@school.edu password123 "Jane Student" student
`);
  process.exit(1);
}

if (args.length < 4) {
  console.error("Error: Missing required arguments.\n");
  printUsage();
}

const [email, password, name, role] = args;

const validRoles = ["admin", "instructor", "student"];
if (!validRoles.includes(role)) {
  console.error(`Error: Role must be one of: ${validRoles.join(", ")}`);
  process.exit(1);
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://edutech:CHANGE_ME@localhost:5432/edutech";

async function addUser() {
  console.log(`\nAdding ${role} user: ${email}`);
  console.log("Connecting to database...");

  const sql = postgres(databaseUrl, { max: 1 });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    console.log("Password hashed successfully.");

    const [user] = await sql`
      INSERT INTO users (email, password_hash, role, name, is_verified, is_active)
      VALUES (${email}, ${passwordHash}, ${role}, ${name}, true, true)
      RETURNING id, email, role, name, is_verified, is_active, created_at
    `;

    console.log("\n✅ User created successfully!");
    console.log("---------------------------");
    console.log(`ID:         ${user.id}`);
    console.log(`Email:      ${user.email}`);
    console.log(`Name:       ${user.name}`);
    console.log(`Role:       ${user.role}`);
    console.log(`Verified:   ${user.is_verified}`);
    console.log(`Active:     ${user.is_active}`);
    console.log(`Created:    ${user.created_at}`);
    console.log("---------------------------\n");

    if (role === "instructor") {
      const [profile] = await sql`
        INSERT INTO instructor_profiles (user_id, headline, bio)
        VALUES (${user.id}, 'New Instructor', 'Instructor biography')
        RETURNING id
      `;
      console.log(`Instructor profile created with ID: ${profile.id}`);
    } else if (role === "student") {
      const [profile] = await sql`
        INSERT INTO student_profiles (user_id)
        VALUES (${user.id})
        RETURNING id
      `;
      console.log(`Student profile created with ID: ${profile.id}`);
    }

    console.log("\nUser can now log in at /auth/login\n");
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    if (e.code === "23505") {
      console.error(
        `\n❌ Error: A user with email "${email}" already exists.\n`,
      );
    } else {
      console.error("\n❌ Database error:", e.message);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

addUser();
