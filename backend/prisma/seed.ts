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
  LocationType,
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
  await prisma.location.deleteMany();
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

  // ==================== VEHICLE TYPES ====================
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

  // ==================== COMPANIES ====================
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
    // ==================== CREATE COMPANY ====================
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

    // ==================== USERS ====================
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

    // ==================== VEHICLES ====================
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

    // ==================== STAFF MEMBERS ====================
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
      const user = await prisma.user.create({
        data: {
          email: `${s.firstname.toLowerCase()}.${s.lastname.toLowerCase()}@${c.code.toLowerCase()}.fr`,
          password: await bcrypt.hash(s.matricule, 10),
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

    // ==================== SHIFT TEMPLATES ====================
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

    // ==================== VEHICLE STAFF SCHEDULES ====================
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    for (let i = 0; i < 3 && i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const staffIndex = i * 2;

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

    // ==================== SERVICES ====================
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

    // ==================== EQUIPMENT ====================
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

    // ==================== DISTANCE RATES ====================
    await prisma.distanceRate.createMany({
      data: [
        { companyId: company.id, minKm: 0, maxKm: 10, price: 30 },
        { companyId: company.id, minKm: 10, maxKm: 25, price: 60 },
        { companyId: company.id, minKm: 25, maxKm: 50, price: 90 },
        { companyId: company.id, minKm: 50, maxKm: 100, price: 150 },
      ],
    });

    // ==================== CUSTOMERS ====================
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

    // ==================== CONTRACTS ====================
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

    // ==================== PATIENTS ====================
    const patients = [];
    const patientData = [
      {
        firstname: 'Ahmed',
        lastname: 'Ben Khelifa',
        birthDate: new Date(1965, 5, 15),
        phone: '+21620000051',
        gender: 'Male',
        address: 'Tunis',
        notes: 'Patient with history of hypertension',
      },
      {
        firstname: 'Fatma',
        lastname: 'Ben Miled',
        birthDate: new Date(1978, 8, 22),
        phone: '+21620000052',
        gender: 'Female',
        address: 'Sousse',
        notes: 'Diabetic patient',
      },
      {
        firstname: 'Mohamed',
        lastname: 'Ben Slimane',
        birthDate: new Date(1955, 2, 10),
        phone: '+21620000053',
        gender: 'Male',
        address: 'Sfax',
        notes: 'Heart condition',
      },
      {
        firstname: 'Nour',
        lastname: 'Ben Hamza',
        birthDate: new Date(1985, 11, 5),
        phone: '+21620000054',
        gender: 'Female',
        address: 'Nabeul',
        notes: 'Asthma patient',
      },
      {
        firstname: 'Karim',
        lastname: 'Ben Ali',
        birthDate: new Date(1990, 3, 20),
        phone: '+21620000055',
        gender: 'Male',
        address: 'Tunis',
        notes: 'Allergic to penicillin',
      },
    ];

    for (const pData of patientData) {
      const patient = await prisma.patient.create({
        data: pData,
      });
      patients.push(patient);
    }

    // ==================== LOCATIONS (formerly Hospital) ====================
    const locations = [];
    const locationData = [
      {
        name: 'Hopital Habib Bourguiba',
        type: LocationType.HOSPITAL,
        phone: '+21671000001',
        address: 'Avenue de la Liberte, Tunis',
        latitude: 36.8065,
        longitude: 10.1815,
        website: 'https://www.hbb.tn',
        email: 'contact@hbb.tn',
        notes: 'Main hospital in Tunis',
      },
      {
        name: 'Hopital Farhat Hached',
        type: LocationType.HOSPITAL,
        phone: '+21673000002',
        address: 'Boulevard 14 Janvier, Sousse',
        latitude: 35.8256,
        longitude: 10.6084,
        website: 'https://www.farhat-hached.tn',
        email: 'contact@fh.tn',
        notes: 'University hospital',
      },
      {
        name: 'Hopital Universitaire Habib Bourguiba',
        type: LocationType.HOSPITAL,
        phone: '+21674000003',
        address: 'Route Menzel Chaker, Sfax',
        latitude: 34.7406,
        longitude: 10.7603,
        website: 'https://www.hubb.tn',
        email: 'contact@hubb.tn',
        notes: 'Teaching hospital',
      },
      {
        name: 'Clinique du Nord',
        type: LocationType.CLINIC,
        phone: '+21671000004',
        address: 'Avenue de France, Tunis',
        latitude: 36.81,
        longitude: 10.178,
        website: 'https://www.clinique-nord.tn',
        email: 'contact@clinique-nord.tn',
        notes: 'Private clinic',
      },
      {
        name: 'Clinique Taoufik',
        type: LocationType.CLINIC,
        phone: '+21674000005',
        address: 'Boulevard Habib Bourguiba, Sfax',
        latitude: 34.735,
        longitude: 10.765,
        website: 'https://www.clinique-taoufik.tn',
        email: 'contact@taoufik.tn',
        notes: 'Specialized in cardiology',
      },
      {
        name: 'Hopital Regional Nabeul',
        type: LocationType.HOSPITAL,
        phone: '+21672000006',
        address: 'Avenue des Martyrs, Nabeul',
        latitude: 36.4513,
        longitude: 10.7356,
        website: 'https://www.hopital-nabeul.tn',
        email: 'contact@hopital-nabeul.tn',
        notes: 'Regional hospital',
      },
      {
        name: 'Pharmacie Centrale Tunis',
        type: LocationType.PHARMACY,
        phone: '+21671000007',
        address: 'Rue de Marseille, Tunis',
        latitude: 36.8025,
        longitude: 10.1785,
        notes: 'Main pharmacy',
      },
      {
        name: 'EHPAD Les Jardins',
        type: LocationType.NURSING_HOME,
        phone: '+21671000008',
        address: 'Route de La Marsa, Tunis',
        latitude: 36.815,
        longitude: 10.185,
        notes: 'Nursing home',
      },
      {
        name: 'Medical Center El Menzah',
        type: LocationType.MEDICAL_CENTER,
        phone: '+21671000009',
        address: 'Avenue Tahar Ben Achour, Tunis',
        latitude: 36.82,
        longitude: 10.175,
        notes: 'Multi-specialty center',
      },
    ];

    for (const locData of locationData) {
      const location = await prisma.location.create({
        data: locData,
      });
      locations.push(location);
    }

    // ==================== MISSIONS ====================
    const missionStatuses = [
      MissionStatus.CREATED,
      MissionStatus.ASSIGNED,
      MissionStatus.DISPATCHED,
      MissionStatus.EN_ROUTE,
      MissionStatus.ON_SCENE,
      MissionStatus.TRANSPORTING,
      MissionStatus.ARRIVED_HOSPITAL,
      MissionStatus.COMPLETED,
    ];

    const priorities = [
      MissionPriority.LOW,
      MissionPriority.NORMAL,
      MissionPriority.HIGH,
      MissionPriority.CRITICAL,
    ];

    // Create 10 missions per company
    for (let i = 0; i < 10; i++) {
      const customer = customers[i % customers.length];
      const contract = contracts[i % contracts.length];
      const patient = patients[i % patients.length];
      const location = locations[i % locations.length];
      const vehicle = vehicles[i % vehicles.length];
      const statusIndex = i % missionStatuses.length;
      const priorityIndex = i % priorities.length;

      // Generate realistic pickup location
      const pickupLat = 36.7 + (Math.random() - 0.5) * 0.5;
      const pickupLng = 10.1 + (Math.random() - 0.5) * 0.5;

      // Calculate mission dates
      const callDate = new Date(
        Date.now() - i * 3600000 - Math.random() * 3600000,
      );
      const dispatchedAt =
        statusIndex >= 2
          ? new Date(callDate.getTime() + 300000 + Math.random() * 300000)
          : null;
      const arrivedSceneAt =
        statusIndex >= 4
          ? new Date(dispatchedAt!.getTime() + 600000 + Math.random() * 600000)
          : null;
      const transportedAt =
        statusIndex >= 5
          ? new Date(
              arrivedSceneAt!.getTime() + 300000 + Math.random() * 300000,
            )
          : null;
      const completedAt =
        statusIndex >= 7
          ? new Date(transportedAt!.getTime() + 900000 + Math.random() * 900000)
          : null;

      const mission = await prisma.mission.create({
        data: {
          code: `${c.code}-M${String(i + 1).padStart(4, '0')}`,
          priority: priorities[priorityIndex],
          status: missionStatuses[statusIndex],
          reason: `Emergency transport for ${patient.firstname} ${patient.lastname}`,
          pickupAddress: `${patient.address}, Tunisia`,
          destination: location.address || `${location.name}, Tunisia`,
          latitude: pickupLat,
          longitude: pickupLng,
          callDate: callDate,
          dispatchedAt: dispatchedAt,
          arrivedSceneAt: arrivedSceneAt,
          transportedAt: transportedAt,
          completedAt: completedAt,
          customerId: customer.id,
          contractId: contract.id,
          patientId: patient.id,
          locationId: location.id,
          notes: `Mission ${i + 1} for ${company.name}`,
        },
      });

      // ==================== MISSION ASSIGNMENT ====================
      if (statusIndex >= 1) {
        const assignment = await prisma.missionAssignment.create({
          data: {
            missionId: mission.id,
            vehicleId: vehicle.id,
            assignedAt: new Date(
              callDate.getTime() + 60000 + Math.random() * 180000,
            ),
            isDefault: true,
            isComplete: statusIndex >= 3,
          },
        });

        // ==================== ASSIGN STAFF ====================
        const staffStartIdx = (i * 2) % staffMembers.length;
        for (let j = 0; j < 2; j++) {
          const staffIdx = (staffStartIdx + j) % staffMembers.length;
          const staff = staffMembers[staffIdx];

          // Check if staff has schedule
          const schedule = await prisma.vehicleStaffSchedule.findFirst({
            where: {
              vehicleId: vehicle.id,
              staffId: staff.id,
              shiftStart: {
                lte: new Date(),
              },
              shiftEnd: {
                gte: new Date(),
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
              checkedIn: statusIndex >= 3,
              checkedInAt:
                statusIndex >= 3
                  ? new Date(
                      callDate.getTime() + 120000 + Math.random() * 180000,
                    )
                  : null,
              checkedOutAt:
                statusIndex >= 7
                  ? new Date(completedAt!.getTime() - 300000)
                  : null,
              notes: `Assigned to mission ${mission.code}`,
            },
          });
        }
      }

      // ==================== MISSION EVENTS ====================
      const eventStatuses = [
        MissionStatus.CREATED,
        MissionStatus.ASSIGNED,
        MissionStatus.DISPATCHED,
        MissionStatus.EN_ROUTE,
        MissionStatus.ON_SCENE,
        MissionStatus.TRANSPORTING,
        MissionStatus.ARRIVED_HOSPITAL,
        MissionStatus.COMPLETED,
      ];

      const eventLimit = Math.min(statusIndex + 1, 8);
      for (let e = 0; e < eventLimit; e++) {
        const eventDate = new Date(callDate);
        eventDate.setMinutes(
          eventDate.getMinutes() + e * 15 + Math.random() * 5,
        );

        await prisma.missionEvent.create({
          data: {
            missionId: mission.id,
            status: eventStatuses[e % eventStatuses.length],
            description: `${eventStatuses[e % eventStatuses.length]} - Mission ${mission.code}`,
            latitude: pickupLat + (Math.random() - 0.5) * 0.05,
            longitude: pickupLng + (Math.random() - 0.5) * 0.05,
            createdAt: eventDate,
          },
        });
      }

      // ==================== GPS POSITIONS ====================
      if (statusIndex >= 3) {
        await prisma.gpsPosition.createMany({
          data: [
            {
              vehicleId: vehicle.id,
              latitude: pickupLat + (Math.random() - 0.5) * 0.02,
              longitude: pickupLng + (Math.random() - 0.5) * 0.02,
              speed: 30 + Math.random() * 40,
              heading: 180 + Math.random() * 30,
              address: `En route to ${patient.address}`,
              createdAt: new Date(
                callDate.getTime() + 300000 + Math.random() * 300000,
              ),
            },
            {
              vehicleId: vehicle.id,
              latitude: pickupLat + (Math.random() - 0.5) * 0.05,
              longitude: pickupLng + (Math.random() - 0.5) * 0.05,
              speed: 20 + Math.random() * 30,
              heading: 200 + Math.random() * 20,
              address: `Approaching ${patient.address}`,
              createdAt: new Date(
                callDate.getTime() + 600000 + Math.random() * 300000,
              ),
            },
          ],
        });
      }

      // ==================== INVOICE (for completed missions) ====================
      if (statusIndex === 7) {
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `${c.code}-INV-${String(i + 1).padStart(4, '0')}`,
            status: [
              InvoiceStatus.DRAFT,
              InvoiceStatus.SENT,
              InvoiceStatus.PAID,
              InvoiceStatus.PARTIALLY_PAID,
            ][i % 4],
            customerId: customer.id,
            missionId: mission.id,
            issueDate: new Date(completedAt!),
            dueDate: new Date(completedAt!.getTime() + 30 * 86400000),
            subtotal: 100 + i * 50 + Math.random() * 100,
            tax: 20 + i * 10,
            total: 120 + i * 60 + Math.random() * 100,
          },
        });

        // Invoice lines
        await prisma.invoiceLine.createMany({
          data: [
            {
              invoiceId: invoice.id,
              description: `Transport service - ${mission.code}`,
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
            {
              invoiceId: invoice.id,
              description: 'Emergency response fee',
              quantity: 1,
              unitPrice: 50 + i * 5,
              total: 50 + i * 5,
            },
          ],
        });
      }

      // ==================== NOTIFICATIONS ====================
      await prisma.notification.create({
        data: {
          title: `Mission ${mission.code}`,
          message: `Mission ${mission.code} - ${mission.status} - ${patient.firstname} ${patient.lastname}`,
          isRead: i % 3 === 0,
          createdAt: new Date(callDate.getTime() + 60000),
        },
      });
    }

    console.log(`✔ ${company.name} seeded`);
  }

  // ==================== FINAL STATISTICS ====================
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
    locations: await prisma.location.count(),
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
  console.log('✅ Seed completed successfully');
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
  console.log(`Locations              : ${stats.locations}`);
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
  console.log('===============================');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
