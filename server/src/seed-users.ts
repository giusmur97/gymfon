import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gymfonty.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gymfonty.com',
      passwordHash: adminPassword,
      role: 'admin',
      hasActiveSessions: true,
      bio: 'Administrator of Gym Fonty platform',
      certifications: ['Personal Trainer Certification', 'Nutrition Specialist'],
      specializations: ['Weight Loss', 'Strength Training', 'Nutrition'],
      hourlyRate: 75.00,
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
      },
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@gymfonty.com' },
    update: {},
    create: {
      name: 'Staff Member',
      email: 'staff@gymfonty.com',
      passwordHash: staffPassword,
      role: 'staff',
      hasActiveSessions: true,
      bio: 'Professional fitness trainer',
      certifications: ['Personal Trainer ISSA'],
      specializations: ['Cardio', 'Functional Training'],
      hourlyRate: 50.00,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: false,
        },
      },
    },
  });

  // Create test client
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@gymfonty.com' },
    update: {},
    create: {
      name: 'Test Client',
      email: 'client@gymfonty.com',
      passwordHash: clientPassword,
      role: 'client',
      hasActiveSessions: true, // This client has purchased sessions
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          marketing: true,
        },
        fitnessGoals: ['Weight Loss', 'Strength Training'],
        fitnessLevel: 'intermediate',
        workoutTypes: ['Gym/Weights', 'Cardio'],
        dietaryRestrictions: [],
        availableDays: ['Monday', 'Wednesday', 'Friday'],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n👤 Test Users Created:');
  console.log('📧 Admin: admin@gymfonty.com | Password: admin123');
  console.log('📧 Staff: staff@gymfonty.com | Password: staff123');
  console.log('📧 Client: client@gymfonty.com | Password: client123');
  console.log('\n🚀 You can now login with these credentials!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });