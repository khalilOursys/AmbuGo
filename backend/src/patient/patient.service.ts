import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';

/**
 * Haversine distance between two GPS points, in kilometers.
 * Rounded to 2 decimals.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius (km)
  const toRad = (d: number) => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createPatientDto: CreatePatientDto) {
    if (createPatientDto.companyId) {
      await this.getCompany(createPatientDto.companyId);
    }

    return await this.prisma.patient.create({
      data: {
        firstname: createPatientDto.firstname,
        lastname: createPatientDto.lastname,
        birthDate: createPatientDto.birthDate
          ? new Date(createPatientDto.birthDate)
          : null,
        phone: createPatientDto.phone,
        gender: createPatientDto.gender,
        address: createPatientDto.address,
        // ✅ GPS
        latitude: createPatientDto.latitude ?? null,
        longitude: createPatientDto.longitude ?? null,
        notes: createPatientDto.notes,
        companyId: createPatientDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.patient.findMany({
      where: {
        ...(companyId && { companyId }),
        isDeleted: false,
      },
      include: {
        company: true,
        _count: {
          select: {
            missions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: FilterPatientDto) {
    const {
      page = 1,
      limit = 10,
      companyId,
      search,
      firstname,
      lastname,
      phone,
      gender,
      address,
      birthDateFrom,
      birthDateTo,
      latitude,
      longitude,
      radiusKm,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
      deletedAt: null,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (firstname) {
      where.firstname = { contains: firstname, mode: 'insensitive' };
    }

    if (lastname) {
      where.lastname = { contains: lastname, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (gender) {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    if (birthDateFrom || birthDateTo) {
      where.birthDate = {};
      if (birthDateFrom) {
        where.birthDate.gte = new Date(birthDateFrom);
      }
      if (birthDateTo) {
        where.birthDate.lte = new Date(birthDateTo);
      }
    }

    // ✅ Proximity filter (bounding box; refined below with Haversine)
    const hasProximity =
      latitude != null && longitude != null && radiusKm != null;

    if (hasProximity) {
      const box = this.boundingBox(latitude!, longitude!, radiusKm!);
      where.latitude = { gte: box.minLat, lte: box.maxLat };
      where.longitude = { gte: box.minLng, lte: box.maxLng };
    }

    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              missions: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.patient.count({ where }),
    ]);

    // ✅ Refine with precise Haversine + attach distanceKm
    let data = patients;
    if (hasProximity) {
      data = patients
        .map((p) => ({
          ...p,
          distanceKm:
            p.latitude != null && p.longitude != null
              ? haversineDistance(
                  latitude!,
                  longitude!,
                  p.latitude,
                  p.longitude,
                )
              : null,
        }))
        .filter((p) => p.distanceKm != null && p.distanceKm <= radiusKm!)
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    }

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      filters: {
        ...(companyId && { companyId }),
        ...(search && { search }),
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
        ...(phone && { phone }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(birthDateFrom && { birthDateFrom }),
        ...(birthDateTo && { birthDateTo }),
        ...(latitude != null && { latitude }),
        ...(longitude != null && { longitude }),
        ...(radiusKm != null && { radiusKm }),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        missions: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            code: true,
            status: true,
            priority: true,
            callDate: true,
            reason: true,
          },
          orderBy: { callDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found.`);
    }

    return patient;
  }

  // ==================== NEARBY ====================

  /**
   * Returns patients within `radiusKm` of (lat, lng), sorted by distance.
   * Uses a bounding box for the SQL filter and Haversine for precise refinement.
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    companyId?: string,
  ) {
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      Number.isNaN(radiusKm) ||
      radiusKm <= 0
    ) {
      throw new BadRequestException(
        'Invalid coordinates or radius. Expected numbers with radius > 0.',
      );
    }

    const box = this.boundingBox(lat, lng, radiusKm);

    const patients = await this.prisma.patient.findMany({
      where: {
        isDeleted: false,
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLng, lte: box.maxLng },
        ...(companyId && { companyId }),
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        phone: true,
        gender: true,
        address: true,
        latitude: true,
        longitude: true,
        companyId: true,
      },
    });

    return patients
      .map((p) => ({
        ...p,
        distanceKm: haversineDistance(lat, lng, p.latitude!, p.longitude!),
      }))
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // ==================== UPDATE ====================

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    await this.findOne(id);

    if (updatePatientDto.companyId) {
      await this.getCompany(updatePatientDto.companyId);
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        firstname: updatePatientDto.firstname,
        lastname: updatePatientDto.lastname,
        birthDate: updatePatientDto.birthDate
          ? new Date(updatePatientDto.birthDate)
          : undefined,
        phone: updatePatientDto.phone,
        gender: updatePatientDto.gender,
        address: updatePatientDto.address,
        // ✅ GPS (undefined = leave unchanged; null = clear)
        latitude: updatePatientDto.latitude,
        longitude: updatePatientDto.longitude,
        notes: updatePatientDto.notes,
        companyId: updatePatientDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    const activeMissions = await this.prisma.mission.count({
      where: {
        patientId: id,
        isDeleted: false,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    if (activeMissions > 0) {
      throw new BadRequestException(
        'Cannot delete patient with active missions.',
      );
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Deleted patient with id ${id} not found.`);
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found.`);
    }

    const missionCount = await this.prisma.mission.count({
      where: {
        patientId: id,
        isDeleted: false,
      },
    });

    if (missionCount > 0) {
      throw new BadRequestException(
        'Cannot delete patient with associated missions. Use soft delete instead.',
      );
    }

    return await this.prisma.patient.delete({
      where: { id },
    });
  }

  // ==================== HELPER METHODS ====================

  private async getCompany(companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        isDeleted: false,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found.`);
    }

    return company;
  }

  /**
   * Bounding box around a point, used as a cheap SQL pre-filter.
   * Returns [minLat, maxLat, minLng, maxLng] as an object.
   */
  private boundingBox(lat: number, lng: number, radiusKm: number) {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    return {
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    };
  }
}
