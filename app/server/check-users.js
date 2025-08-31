const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        email: true
      }
    });

    console.log('Users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.userId}, Username: ${user.username}, Email: ${user.email}`);
    });

    if (users.length === 0) {
      console.log('No users found in database');
    }

  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
