import { PrismaClient, PricingType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.distanceRate.deleteMany();
  await prisma.service.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('Database cleaned.');

  const password = await bcrypt.hash('Admin123!', 10);

  const companies = [
    {
      code: 'CMP1',
      name: 'Ambulance Tunis',
      address: 'Tunis',
      latitude: 36.8065,
      longitude: 10.1815,
    },
    {
      code: 'CMP2',
      name: 'Ambulance Sousse',
      address: 'Sousse',
      latitude: 35.8256,
      longitude: 10.6084,
    },
    {
      code: 'CMP3',
      name: 'Ambulance Sfax',
      address: 'Sfax',
      latitude: 34.7406,
      longitude: 10.7603,
    },
    {
      code: 'CMP4',
      name: 'Ambulance Nabeul',
      address: 'Nabeul',
      latitude: 36.4513,
      longitude: 10.7356,
    },
  ];

  for (const c of companies) {
    const company = await prisma.company.create({
      data: {
        name: c.name,
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        radiusKm: 10,
        pricingType: PricingType.FIXED,
        baseCurrency: 'TND',
        phone: '+21670000000',
        email: `contact@${c.code.toLowerCase()}.tn`,
        rib: 'TN590000000000000000000000',
        matriculeFiscale: 'MF' + Math.floor(100000 + Math.random() * 900000),
      },
    });

    // USERS
    await prisma.user.createMany({
      data: [
        {
          companyId: company.id,
          email: `admin@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Admin',
          lastName: c.address,
          telephone: '+21620000001',
          cin: crypto.randomUUID().substring(0, 8),
          role: UserRole.ADMIN,
        },
        {
          companyId: company.id,
          email: `dispatcher@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Ali',
          lastName: 'Dispatcher',
          telephone: '+21620000002',
          cin: crypto.randomUUID().substring(0, 8),
          role: UserRole.DISPATCHER,
        },
        {
          companyId: company.id,
          email: `supervisor@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Mohamed',
          lastName: 'Supervisor',
          telephone: '+21620000003',
          cin: crypto.randomUUID().substring(0, 8),
          role: UserRole.SUPERVISOR,
        },
        {
          companyId: company.id,
          email: `manager@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Ahmed',
          lastName: 'Manager',
          telephone: '+21620000004',
          cin: crypto.randomUUID().substring(0, 8),
          role: UserRole.MANAGER,
        },
      ],
    });

    // SERVICES
    await prisma.service.createMany({
      data: [
        {
          companyId: company.id,
          code: `${c.code}-BLS`,
          name: 'Basic Life Support',
          description: 'Standard ambulance transport',
          unitPrice: 80,
        },
        {
          companyId: company.id,
          code: `${c.code}-ALS`,
          name: 'Advanced Life Support',
          description: 'Advanced ambulance transport',
          unitPrice: 150,
        },
        {
          companyId: company.id,
          code: `${c.code}-ICU`,
          name: 'Mobile ICU',
          description: 'Intensive care transport',
          unitPrice: 250,
        },
        {
          companyId: company.id,
          code: `${c.code}-EVENT`,
          name: 'Event Medical Coverage',
          description: 'Medical coverage for events',
          unitPrice: 400,
        },
      ],
    });

    // EQUIPMENT
    await prisma.equipment.createMany({
      data: [
        {
          companyId: company.id,
          code: `${c.code}-EQ01`,
          name: 'Defibrillator',
          description: 'Portable AED',
          quantity: 6,
          purchasePrice: 4500,
        },
        {
          companyId: company.id,
          code: `${c.code}-EQ02`,
          name: 'Ventilator',
          description: 'Transport ventilator',
          quantity: 3,
          purchasePrice: 6500,
        },
        {
          companyId: company.id,
          code: `${c.code}-EQ03`,
          name: 'Oxygen Cylinder',
          description: 'Medical oxygen cylinder',
          quantity: 20,
          purchasePrice: 350,
        },
        {
          companyId: company.id,
          code: `${c.code}-EQ04`,
          name: 'Patient Monitor',
          description: 'Vital signs monitor',
          quantity: 5,
          purchasePrice: 2800,
        },
      ],
    });

    // DISTANCE RATES
    await prisma.distanceRate.createMany({
      data: [
        {
          companyId: company.id,
          minKm: 0,
          maxKm: 10,
          price: 30,
        },
        {
          companyId: company.id,
          minKm: 10,
          maxKm: 25,
          price: 60,
        },
        {
          companyId: company.id,
          minKm: 25,
          maxKm: 50,
          price: 90,
        },
        {
          companyId: company.id,
          minKm: 50,
          maxKm: 100,
          price: 150,
        },
      ],
    });

    console.log(`✔ ${company.name} seeded`);
  }

  const stats = {
    companies: await prisma.company.count(),
    users: await prisma.user.count(),
    services: await prisma.service.count(),
    equipment: await prisma.equipment.count(),
    rates: await prisma.distanceRate.count(),
  };

  console.log('\n===============================');
  console.log('Seed completed successfully');
  console.log('===============================');
  console.log(`Companies      : ${stats.companies}`);
  console.log(`Users          : ${stats.users}`);
  console.log(`Services       : ${stats.services}`);
  console.log(`Equipment      : ${stats.equipment}`);
  console.log(`Distance Rates : ${stats.rates}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
