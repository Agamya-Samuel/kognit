import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { users, instructorProfiles, studentProfiles, courses, sections, lectures, enrollments } from './schema';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const instructorPassword = await bcrypt.hash('Instructor@123', 12);
    const studentPassword = await bcrypt.hash('Student@123', 12);

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        email: 'admin@edutech.com',
        passwordHash: adminPassword,
        role: 'admin',
        name: 'Admin User',
        isVerified: true,
        isActive: true,
      })
      .returning();
    console.log('✅ Created admin user:', adminUser.email);

    // Create instructor user
    const [instructorUser] = await db
      .insert(users)
      .values({
        email: 'instructor@edutech.com',
        passwordHash: instructorPassword,
        role: 'instructor',
        name: 'John Instructor',
        isVerified: true,
        isActive: true,
      })
      .returning();
    console.log('✅ Created instructor user:', instructorUser.email);

    // Create instructor profile
    const [instructorProfile] = await db
      .insert(instructorProfiles)
      .values({
        userId: instructorUser.id,
        bio: 'Experienced web developer with 10+ years in the industry',
        expertise: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        socialLinks: ['https://linkedin.com/in/johninstructor'],
        approvalStatus: 'approved',
      })
      .returning();
    console.log('✅ Created instructor profile');

    // Create student users
    const [student1] = await db
      .insert(users)
      .values({
        email: 'student1@edutech.com',
        passwordHash: studentPassword,
        role: 'student',
        name: 'Alice Student',
        isVerified: true,
        isActive: true,
      })
      .returning();

    const [student2] = await db
      .insert(users)
      .values({
        email: 'student2@edutech.com',
        passwordHash: studentPassword,
        role: 'student',
        name: 'Bob Student',
        isVerified: true,
        isActive: true,
      })
      .returning();
    console.log('✅ Created 2 student users');

    // Create student profiles
    await db.insert(studentProfiles).values([
      {
        userId: student1.id,
        skills: ['JavaScript', 'HTML', 'CSS'],
        placementStatus: 'looking',
      },
      {
        userId: student2.id,
        skills: ['Python', 'Django', 'SQL'],
        placementStatus: 'not_looking',
      },
    ]);
    console.log('✅ Created student profiles');

    // Create a course
    const [course] = await db
      .insert(courses)
      .values({
        instructorId: instructorUser.id,
        title: 'Complete Web Development Bootcamp',
        description: 'Learn modern web development from scratch with hands-on projects',
        domain: 'tech',
        pricingType: 'paid',
        priceInr: 49900, // ₹499.00 in paise
        courseStructure: 'normal',
        status: 'published',
      })
      .returning();
    console.log('✅ Created course:', course.title);

    // Create sections
    const [section1] = await db
      .insert(sections)
      .values({
        courseId: course.id,
        title: 'Introduction to Web Development',
        orderIndex: 1,
      })
      .returning();

    const [section2] = await db
      .insert(sections)
      .values({
        courseId: course.id,
        title: 'HTML & CSS Fundamentals',
        orderIndex: 2,
      })
      .returning();
    console.log('✅ Created 2 course sections');

    // Create lectures
    await db.insert(lectures).values([
      {
        sectionId: section1.id,
        title: 'What is Web Development?',
        description: 'Introduction to web development concepts',
        orderIndex: 1,
        type: 'video',
        durationSeconds: 600,
        isPublished: true,
        isFreePreview: true,
      },
      {
        sectionId: section1.id,
        title: 'Setting Up Your Environment',
        description: 'Install VS Code and other tools',
        orderIndex: 2,
        type: 'text',
        isPublished: true,
      },
      {
        sectionId: section2.id,
        title: 'HTML Basics',
        description: 'Learn HTML tags and structure',
        orderIndex: 3,
        type: 'video',
        durationSeconds: 1200,
        isPublished: true,
      },
    ]);
    console.log('✅ Created 3 lectures');

    // Create enrollment for student1
    await db.insert(enrollments).values({
      studentId: student1.id,
      courseId: course.id,
      accessType: 'purchased',
    });
    console.log('✅ Created enrollment for student1');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Admin: admin@edutech.com / Admin@123');
    console.log('  Instructor: instructor@edutech.com / Instructor@123');
    console.log('  Student 1: student1@edutech.com / Student@123');
    console.log('  Student 2: student2@edutech.com / Student@123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
