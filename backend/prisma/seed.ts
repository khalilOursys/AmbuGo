import {
  PrismaClient,
  PricingType,
  UserRole,
  MissionPriority,
  MissionStatus,
  VehicleStatus,
  StaffType,
  InvoiceStatus,
  AmbulanceLevel,
  ShiftType,
  ScheduleStatus,
  WeekDay,
  StaffSourceType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');

  // Clean in correct order (respect foreign keys)
  await prisma.assignmentStaff.deleteMany();
  await prisma.missionAssignment.deleteMany();
  await prisma.missionEquipment.deleteMany();
  await prisma.vehicleEquipment.deleteMany();
  await prisma.missionDocument.deleteMany();
  await prisma.document.deleteMany();
  await prisma.missionEvent.deleteMany();
  await prisma.gpsPosition.deleteMany();
  await prisma.vehicleStaffSchedule.deleteMany();
  await prisma.shiftTemplate.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.service.deleteMany();
  await prisma.distanceRate.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.vehicleType.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.file.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('Database cleaned.');

  const password = await bcrypt.hash('Admin123!', 10);

  // Create Vehicle Types once (global, not per company)
  const vehicleTypeNames = [
    'Ambulance BLS',
    'Ambulance ALS',
    'Ambulance ICU',
    'Support Vehicle',
  ];

  const vehicleTypes = [];
  for (const name of vehicleTypeNames) {
    const vt = await prisma.vehicleType.create({
      data: { name },
    });
    vehicleTypes.push(vt);
  }

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

    // USERS (Admin, Dispatcher, Supervisor, Manager)
    await prisma.user.createMany({
      data: [
        {
          companyId: company.id,
          email: `admin@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Admin',
          lastName: c.address,
          telephone: '+21620000001',
          cin: Math.floor(
            100000000000 + Math.random() * 900000000000,
          ).toString(),
          role: UserRole.ADMIN,
        },
        {
          companyId: company.id,
          email: `dispatcher@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Ali',
          lastName: 'Dispatcher',
          telephone: '+21620000002',
          cin: Math.floor(
            100000000000 + Math.random() * 900000000000,
          ).toString(),
          role: UserRole.DISPATCHER,
        },
        {
          companyId: company.id,
          email: `supervisor@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Mohamed',
          lastName: 'Supervisor',
          telephone: '+21620000003',
          cin: Math.floor(
            100000000000 + Math.random() * 900000000000,
          ).toString(),
          role: UserRole.SUPERVISOR,
        },
        {
          companyId: company.id,
          email: `manager@${c.code.toLowerCase()}.tn`,
          password,
          firstName: 'Ahmed',
          lastName: 'Manager',
          telephone: '+21620000004',
          cin: Math.floor(
            100000000000 + Math.random() * 900000000000,
          ).toString(),
          role: UserRole.MANAGER,
        },
      ],
    });

    // VEHICLES
    const vehicles = [];
    const vehicleData = [
      {
        registration: `${c.code}-V001`,
        brand: 'Mercedes',
        model: 'Sprinter',
        level: AmbulanceLevel.BLS,
      },
      {
        registration: `${c.code}-V002`,
        brand: 'Mercedes',
        model: 'Sprinter',
        level: AmbulanceLevel.ALS,
      },
      {
        registration: `${c.code}-V003`,
        brand: 'Ford',
        model: 'Transit',
        level: AmbulanceLevel.BLS,
      },
      {
        registration: `${c.code}-V004`,
        brand: 'Volkswagen',
        model: 'Crafter',
        level: AmbulanceLevel.ICU,
      },
      {
        registration: `${c.code}-V005`,
        brand: 'Mercedes',
        model: 'Sprinter',
        level: AmbulanceLevel.ALS,
      },
    ];

    for (let i = 0; i < vehicleData.length; i++) {
      const v = await prisma.vehicle.create({
        data: {
          ...vehicleData[i],
          companyId: company.id,
          vehicleTypeId: vehicleTypes[i % vehicleTypes.length].id,
          status: VehicleStatus.AVAILABLE,
        },
      });
      vehicles.push(v);
    }

    // STAFF MEMBERS with automatic User creation
    const staffData = [
      {
        matricule: `${c.code}-EMP-001`,
        firstname: 'Jean',
        lastname: 'Martin',
        phone: '+33601020304',
        type: StaffType.DRIVER,
      },
      {
        matricule: `${c.code}-EMP-002`,
        firstname: 'Marie',
        lastname: 'Bernard',
        phone: '+33605060708',
        type: StaffType.DRIVER,
      },
      {
        matricule: `${c.code}-EMP-003`,
        firstname: 'Pierre',
        lastname: 'Dubois',
        phone: '+33609101112',
        type: StaffType.PARAMEDIC,
      },
      {
        matricule: `${c.code}-EMP-004`,
        firstname: 'Sophie',
        lastname: 'Petit',
        phone: '+33613141516',
        type: StaffType.PARAMEDIC,
      },
      {
        matricule: `${c.code}-EMP-005`,
        firstname: 'Lucas',
        lastname: 'Moreau',
        phone: '+33617181920',
        type: StaffType.DOCTOR,
      },
      {
        matricule: `${c.code}-EMP-006`,
        firstname: 'Emma',
        lastname: 'Roux',
        phone: '+33621222324',
        type: StaffType.NURSE,
      },
      {
        matricule: `${c.code}-EMP-007`,
        firstname: 'Thomas',
        lastname: 'Lefevre',
        phone: '+33625262728',
        type: StaffType.DRIVER,
      },
      {
        matricule: `${c.code}-EMP-008`,
        firstname: 'Julie',
        lastname: 'Morel',
        phone: '+33629303132',
        type: StaffType.PARAMEDIC,
      },
    ];

    const staffMembers = [];
    for (const s of staffData) {
      // Create User first with matricule as default password
      const user = await prisma.user.create({
        data: {
          email: `${s.firstname.toLowerCase()}.${s.lastname.toLowerCase()}@${c.code.toLowerCase()}.fr`,
          password: await bcrypt.hash(s.matricule, 10), // 🔑 matricule = default password
          firstName: s.firstname,
          lastName: s.lastname,
          telephone: s.phone,
          cin: Math.floor(
            100000000000 + Math.random() * 900000000000,
          ).toString(),
          role: UserRole.STAFF,
          companyId: company.id,
        },
      });

      // Then create StaffMember linked to User
      const staff = await prisma.staffMember.create({
        data: {
          matricule: s.matricule,
          firstname: s.firstname,
          lastname: s.lastname,
          phone: s.phone,
          email: user.email,
          type: s.type,
          userId: user.id,
          companyId: company.id,
        },
      });

      staffMembers.push(staff);
    }

    // SHIFT TEMPLATES
    await prisma.shiftTemplate.createMany({
      data: [
        {
          name: `${c.code} - Morning Shift`,
          description: 'Morning shift 08:00 - 15:00',
          startTime: '08:00',
          endTime: '15:00',
          shiftType: ShiftType.MORNING,
          daysOfWeek: [
            WeekDay.MONDAY,
            WeekDay.TUESDAY,
            WeekDay.WEDNESDAY,
            WeekDay.THURSDAY,
            WeekDay.FRIDAY,
          ],
          minStaffRequired: 2,
          companyId: company.id,
          isActive: true,
        },
        {
          name: `${c.code} - Afternoon Shift`,
          description: 'Afternoon shift 15:00 - 22:00',
          startTime: '15:00',
          endTime: '22:00',
          shiftType: ShiftType.AFTERNOON,
          daysOfWeek: [
            WeekDay.MONDAY,
            WeekDay.TUESDAY,
            WeekDay.WEDNESDAY,
            WeekDay.THURSDAY,
            WeekDay.FRIDAY,
          ],
          minStaffRequired: 2,
          companyId: company.id,
          isActive: true,
        },
        {
          name: `${c.code} - Night Shift`,
          description: 'Night shift 22:00 - 08:00',
          startTime: '22:00',
          endTime: '08:00',
          shiftType: ShiftType.NIGHT,
          daysOfWeek: [
            WeekDay.MONDAY,
            WeekDay.TUESDAY,
            WeekDay.WEDNESDAY,
            WeekDay.THURSDAY,
            WeekDay.FRIDAY,
          ],
          minStaffRequired: 2,
          companyId: company.id,
          isActive: true,
        },
        {
          name: `${c.code} - Weekend Day Shift`,
          description: 'Weekend day shift 09:00 - 17:00',
          startTime: '09:00',
          endTime: '17:00',
          shiftType: ShiftType.MORNING,
          daysOfWeek: [WeekDay.SATURDAY, WeekDay.SUNDAY],
          minStaffRequired: 2,
          companyId: company.id,
          isActive: true,
        },
      ],
    });

    const templates = await prisma.shiftTemplate.findMany({
      where: { companyId: company.id },
    });

    // VEHICLE STAFF SCHEDULES
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    // Create schedules for the first 3 vehicles
    for (let i = 0; i < 3 && i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const staffIndex = i * 2;

      // Morning shift schedule
      await prisma.vehicleStaffSchedule.create({
        data: {
          vehicleId: vehicle.id,
          staffId: staffMembers[staffIndex % staffMembers.length].id,
          shiftStart: new Date(startOfWeek.setHours(8, 0, 0, 0)),
          shiftEnd: new Date(startOfWeek.setHours(15, 0, 0, 0)),
          shiftType: ShiftType.MORNING,
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
          validFrom: new Date(),
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          status: ScheduleStatus.ACTIVE,
          shiftTemplateId: templates[0]?.id,
          notes: 'Regular morning shift',
        },
      });

      // Afternoon shift schedule
      await prisma.vehicleStaffSchedule.create({
        data: {
          vehicleId: vehicle.id,
          staffId: staffMembers[(staffIndex + 1) % staffMembers.length].id,
          shiftStart: new Date(startOfWeek.setHours(15, 0, 0, 0)),
          shiftEnd: new Date(startOfWeek.setHours(22, 0, 0, 0)),
          shiftType: ShiftType.AFTERNOON,
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
          validFrom: new Date(),
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)),
          status: ScheduleStatus.ACTIVE,
          shiftTemplateId: templates[1]?.id,
          notes: 'Regular afternoon shift',
        },
      });
    }

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

    // CUSTOMERS
    const customers = [];
    const customerData = [
      {
        code: `${c.code}-C001`,
        name: 'Hopital Habib Bourguiba',
        phone: '+21671000001',
        address: 'Tunis',
      },
      {
        code: `${c.code}-C002`,
        name: 'Hopital Farhat Hached',
        phone: '+21673000002',
        address: 'Sousse',
      },
      {
        code: `${c.code}-C003`,
        name: 'Clinique du Nord',
        phone: '+21671000003',
        address: 'Tunis',
      },
      {
        code: `${c.code}-C004`,
        name: 'Clinique Taoufik',
        phone: '+21674000004',
        address: 'Sfax',
      },
    ];

    for (const cData of customerData) {
      const customer = await prisma.customer.create({
        data: {
          ...cData,
          companyId: company.id,
        },
      });
      customers.push(customer);
    }

    // CONTRACTS
    const contracts = [];
    const contractData = [
      {
        reference: `${c.code}-CON-001`,
        title: 'Basic Service Contract',
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 11, 31),
      },
      {
        reference: `${c.code}-CON-002`,
        title: 'Premium Service Contract',
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 11, 31),
      },
    ];

    for (let i = 0; i < contractData.length && i < customers.length; i++) {
      const contract = await prisma.contract.create({
        data: {
          ...contractData[i],
          customerId: customers[i % customers.length].id,
        },
      });
      contracts.push(contract);
    }

    // PATIENTS
    const patients = [];
    const patientData = [
      {
        firstname: 'Ahmed',
        lastname: 'Ben Khelifa',
        birthDate: new Date(1965, 5, 15),
        phone: '+21620000051',
        gender: 'Male',
        address: 'Tunis',
      },
      {
        firstname: 'Fatma',
        lastname: 'Ben Miled',
        birthDate: new Date(1978, 8, 22),
        phone: '+21620000052',
        gender: 'Female',
        address: 'Sousse',
      },
      {
        firstname: 'Mohamed',
        lastname: 'Ben Slimane',
        birthDate: new Date(1955, 2, 10),
        phone: '+21620000053',
        gender: 'Male',
        address: 'Sfax',
      },
      {
        firstname: 'Nour',
        lastname: 'Ben Hamza',
        birthDate: new Date(1985, 11, 5),
        phone: '+21620000054',
        gender: 'Female',
        address: 'Nabeul',
      },
    ];

    for (const pData of patientData) {
      const patient = await prisma.patient.create({
        data: pData,
      });
      patients.push(patient);
    }

    // HOSPITALS
    const hospitals = [];
    const hospitalData = [
      {
        name: 'Hopital Habib Bourguiba',
        phone: '+21671000001',
        address: 'Tunis',
        latitude: 36.8065,
        longitude: 10.1815,
      },
      {
        name: 'Hopital Farhat Hached',
        phone: '+21673000002',
        address: 'Sousse',
        latitude: 35.8256,
        longitude: 10.6084,
      },
      {
        name: 'Hopital Universitaire Habib Bourguiba',
        phone: '+21674000003',
        address: 'Sfax',
        latitude: 34.7406,
        longitude: 10.7603,
      },
    ];

    for (const hData of hospitalData) {
      const hospital = await prisma.hospital.create({
        data: hData,
      });
      hospitals.push(hospital);
    }

    // MISSIONS
    const missionStatuses = [
      MissionStatus.CREATED,
      MissionStatus.ASSIGNED,
      MissionStatus.DISPATCHED,
      MissionStatus.EN_ROUTE,
      MissionStatus.ON_SCENE,
      MissionStatus.COMPLETED,
    ];

    // Create missions for each company
    for (let i = 0; i < 5; i++) {
      const customer = customers[i % customers.length];
      const contract = contracts[i % contracts.length];
      const patient = patients[i % patients.length];
      const hospital = hospitals[i % hospitals.length];
      const vehicle = vehicles[i % vehicles.length];

      // Create the mission first
      const mission = await prisma.mission.create({
        data: {
          code: `${c.code}-M${String(i + 1).padStart(4, '0')}`,
          priority: [
            MissionPriority.LOW,
            MissionPriority.NORMAL,
            MissionPriority.HIGH,
            MissionPriority.CRITICAL,
          ][i % 4],
          status: missionStatuses[i % missionStatuses.length],
          reason: `Emergency transport for ${patient.firstname} ${patient.lastname}`,
          pickupAddress: `${patient.address}, Tunisia`,
          destination: hospital.address || 'Hospital',
          latitude: 36 + i * 0.1,
          longitude: 10 + i * 0.1,
          callDate: new Date(Date.now() - i * 3600000),
          customerId: customer.id,
          contractId: contract.id,
          patientId: patient.id,
          hospitalId: hospital.id,
          notes: `Mission ${i + 1} created automatically`,
        },
      });

      // Create mission assignment
      const assignment = await prisma.missionAssignment.create({
        data: {
          missionId: mission.id,
          vehicleId: vehicle.id,
          assignedAt: new Date(Date.now() - i * 1800000),
          isDefault: true,
          isComplete: false,
        },
      });

      // Assign 2 staff members to the mission
      const staffStartIdx = (i * 2) % staffMembers.length;
      for (let j = 0; j < 2; j++) {
        const staffIdx = (staffStartIdx + j) % staffMembers.length;
        const staff = staffMembers[staffIdx];

        // Try to find an existing schedule for this staff
        const schedule = await prisma.vehicleStaffSchedule.findFirst({
          where: {
            vehicleId: vehicle.id,
            staffId: staff.id,
            shiftStart: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
            status: ScheduleStatus.ACTIVE,
          },
        });

        await prisma.assignmentStaff.create({
          data: {
            assignmentId: assignment.id,
            staffId: staff.id,
            sourceType: schedule
              ? StaffSourceType.SCHEDULE
              : StaffSourceType.MANUAL,
            scheduleId: schedule?.id || null,
            isReplacement: false,
            checkedIn: i % 3 === 0,
            checkedInAt:
              i % 3 === 0 ? new Date(Date.now() - i * 1800000) : null,
            notes: `Staff assigned to mission ${i + 1}`,
          },
        });
      }

      // Create mission events
      const eventStatuses = [
        MissionStatus.CREATED,
        MissionStatus.ASSIGNED,
        MissionStatus.DISPATCHED,
        MissionStatus.EN_ROUTE,
        MissionStatus.ON_SCENE,
        MissionStatus.COMPLETED,
      ];

      for (let e = 0; e < Math.min(i + 1, 4); e++) {
        await prisma.missionEvent.create({
          data: {
            missionId: mission.id,
            status: eventStatuses[e % eventStatuses.length],
            description: `Event ${e + 1} for mission ${i + 1}`,
            latitude: 36 + i * 0.1 + e * 0.01,
            longitude: 10 + i * 0.1 + e * 0.01,
            createdAt: new Date(Date.now() - (i - e) * 1800000),
          },
        });
      }

      // Create invoice for completed missions
      if (i % 2 === 0 && mission.status === MissionStatus.COMPLETED) {
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `${c.code}-INV-${String(i + 1).padStart(4, '0')}`,
            status: [
              InvoiceStatus.DRAFT,
              InvoiceStatus.SENT,
              InvoiceStatus.PAID,
            ][i % 3],
            customerId: customer.id,
            missionId: mission.id,
            issueDate: new Date(Date.now() - i * 86400000),
            dueDate: new Date(Date.now() + 30 * 86400000),
            subtotal: 100 + i * 50,
            tax: 20 + i * 10,
            total: 120 + i * 60,
          },
        });

        // Create invoice lines
        await prisma.invoiceLine.createMany({
          data: [
            {
              invoiceId: invoice.id,
              description: `Transport service - Mission ${mission.code}`,
              quantity: 1,
              unitPrice: 80 + i * 20,
              total: 80 + i * 20,
            },
            {
              invoiceId: invoice.id,
              description: 'Medical supplies',
              quantity: 1,
              unitPrice: 20 + i * 10,
              total: 20 + i * 10,
            },
          ],
        });
      }

      // Create GPS positions for vehicles in mission
      if (i % 2 === 0) {
        await prisma.gpsPosition.createMany({
          data: [
            {
              vehicleId: vehicle.id,
              latitude: 36.8 + i * 0.05,
              longitude: 10.2 + i * 0.05,
              speed: 40 + i * 5,
              heading: 180 + i * 10,
              address: `Position ${i + 1}`,
              createdAt: new Date(Date.now() - i * 3600000),
            },
            {
              vehicleId: vehicle.id,
              latitude: 36.9 + i * 0.05,
              longitude: 10.3 + i * 0.05,
              speed: 30 + i * 5,
              heading: 170 + i * 10,
              address: `Position ${i + 2}`,
              createdAt: new Date(Date.now() - i * 7200000),
            },
          ],
        });
      }

      // Create some notifications
      await prisma.notification.create({
        data: {
          title: `New Mission ${mission.code}`,
          message: `Mission ${mission.code} has been created with priority ${mission.priority}`,
          isRead: i % 3 === 0,
          createdAt: new Date(Date.now() - i * 3600000),
        },
      });
    }

    console.log(`✔ ${company.name} seeded`);
  }

  // Display final statistics
  const stats = {
    companies: await prisma.company.count(),
    users: await prisma.user.count(),
    vehicleTypes: await prisma.vehicleType.count(),
    vehicles: await prisma.vehicle.count(),
    staffMembers: await prisma.staffMember.count(),
    shiftTemplates: await prisma.shiftTemplate.count(),
    vehicleStaffSchedules: await prisma.vehicleStaffSchedule.count(),
    customers: await prisma.customer.count(),
    contracts: await prisma.contract.count(),
    patients: await prisma.patient.count(),
    hospitals: await prisma.hospital.count(),
    missions: await prisma.mission.count(),
    missionAssignments: await prisma.missionAssignment.count(),
    assignmentStaff: await prisma.assignmentStaff.count(),
    missionEvents: await prisma.missionEvent.count(),
    gpsPositions: await prisma.gpsPosition.count(),
    invoices: await prisma.invoice.count(),
    invoiceLines: await prisma.invoiceLine.count(),
    services: await prisma.service.count(),
    equipment: await prisma.equipment.count(),
    distanceRates: await prisma.distanceRate.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('\n===============================');
  console.log('Seed completed successfully');
  console.log('===============================');
  console.log(`Companies              : ${stats.companies}`);
  console.log(`Users                  : ${stats.users}`);
  console.log(`Vehicle Types          : ${stats.vehicleTypes}`);
  console.log(`Vehicles               : ${stats.vehicles}`);
  console.log(`Staff Members          : ${stats.staffMembers}`);
  console.log(`Shift Templates        : ${stats.shiftTemplates}`);
  console.log(`Vehicle Staff Schedules: ${stats.vehicleStaffSchedules}`);
  console.log(`Customers              : ${stats.customers}`);
  console.log(`Contracts              : ${stats.contracts}`);
  console.log(`Patients               : ${stats.patients}`);
  console.log(`Hospitals              : ${stats.hospitals}`);
  console.log(`Missions               : ${stats.missions}`);
  console.log(`Mission Assignments    : ${stats.missionAssignments}`);
  console.log(`Assignment Staff       : ${stats.assignmentStaff}`);
  console.log(`Mission Events         : ${stats.missionEvents}`);
  console.log(`GPS Positions          : ${stats.gpsPositions}`);
  console.log(`Invoices               : ${stats.invoices}`);
  console.log(`Invoice Lines          : ${stats.invoiceLines}`);
  console.log(`Services               : ${stats.services}`);
  console.log(`Equipment              : ${stats.equipment}`);
  console.log(`Distance Rates         : ${stats.distanceRates}`);
  console.log(`Notifications          : ${stats.notifications}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
