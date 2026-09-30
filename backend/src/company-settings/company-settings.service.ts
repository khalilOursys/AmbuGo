import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateCompanySettingsDto } from './dto/update-company-setting.dto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CompanySettingsService {
  constructor(private prisma: PrismaService) {}

  private serialize(company: any) {
    if (!company) {
      return {
        id: null,
        companyName: '',
        slug: '',
        legalName: '',
        email: '',
        phone: '',
        fax: '',
        website: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        taxNumber: '',
        rib: '',
        iban: '',
        bankName: '',
        vatRate: 0,
        currency: 'TND',
        defaultPaymentTerms: 30,
        invoicePrefix: 'INV-',
        pricingType: 'FIXED',
        status: 'ACTIVE',
        timezone: 'Africa/Tunis',
        locale: 'fr-TN',
        logo: '',
        distanceRates: [],
        createdAt: null,
        updatedAt: null,
      };
    }
    return {
      id: company.id,
      companyName: company.name,
      slug: company.slug,
      legalName: company.legalName ?? '',
      email: company.email ?? '',
      phone: company.phone ?? '',
      fax: company.fax ?? '',
      website: company.website ?? '',
      address: company.address ?? '',
      city: company.city ?? '',
      postalCode: company.postalCode ?? '',
      country: company.country ?? '',
      taxNumber: company.matriculeFiscale ?? '',
      rib: company.rib ?? '',
      iban: company.iban ?? '',
      bankName: company.bankName ?? '',
      vatRate: company.vatRate ?? 0,
      currency: company.baseCurrency,
      defaultPaymentTerms: company.defaultPaymentTerms ?? 30,
      invoicePrefix: company.invoicePrefix ?? 'INV-',
      pricingType: company.pricingType,
      status: company.status,
      timezone: company.timezone,
      locale: company.locale,
      logo: company.logo?.url ?? '',
      distanceRates: (company.distanceRates ?? []).map((r: any) => ({
        id: r.id,
        minKm: r.minKm,
        maxKm: r.maxKm,
        price: Number(r.price),
      })),
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  /**
   * Get company by ID. If no id provided, fall back to first non-deleted company.
   */
  async get(id?: string) {
    const where: any = { isDeleted: false };
    if (id) where.id = id;

    const company = await this.prisma.company.findFirst({
      where,
      include: {
        logo: true,
        distanceRates: { orderBy: { minKm: 'asc' } },
      },
    });
    return this.serialize(company);
  }

  async updateProfile(dto: UpdateCompanySettingsDto) {
    let company;

    // 👇 Prefer explicit id; fall back to first company for backward compat
    if (dto.id) {
      company = await this.prisma.company.findFirst({
        where: { id: dto.id, isDeleted: false },
      });
      if (!company) {
        throw new NotFoundException(`Company with id ${dto.id} not found`);
      }
    } else {
      company = await this.prisma.company.findFirst({
        where: { isDeleted: false },
      });
    }

    const data: any = {};
    if (dto.companyName !== undefined) data.name = dto.companyName;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.legalName !== undefined) data.legalName = dto.legalName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.fax !== undefined) data.fax = dto.fax;
    if (dto.website !== undefined) data.website = dto.website;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.postalCode !== undefined) data.postalCode = dto.postalCode;
    if (dto.country !== undefined) data.country = dto.country;
    if (dto.taxNumber !== undefined) data.matriculeFiscale = dto.taxNumber;
    if (dto.rib !== undefined) data.rib = dto.rib;
    if (dto.iban !== undefined) data.iban = dto.iban;
    if (dto.bankName !== undefined) data.bankName = dto.bankName;
    if (dto.vatRate !== undefined) data.vatRate = dto.vatRate;
    if (dto.currency !== undefined) data.baseCurrency = dto.currency;
    if (dto.defaultPaymentTerms !== undefined)
      data.defaultPaymentTerms = dto.defaultPaymentTerms;
    if (dto.invoicePrefix !== undefined) data.invoicePrefix = dto.invoicePrefix;
    if (dto.pricingType !== undefined) data.pricingType = dto.pricingType;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.locale !== undefined) data.locale = dto.locale;

    if (!company) {
      // Create new (only when no id given and no company exists)
      company = await this.prisma.company.create({
        data: {
          name: dto.companyName ?? 'My Company',
          slug: dto.slug ?? `company-${Date.now()}`,
          ...data,
        },
      });
    } else {
      company = await this.prisma.company.update({
        where: { id: company.id },
        data,
      });
    }

    if (dto.distanceRates !== undefined) {
      await this.prisma.$transaction([
        this.prisma.distanceRate.deleteMany({
          where: { companyId: company.id },
        }),
        this.prisma.distanceRate.createMany({
          data: dto.distanceRates.map((r) => ({
            companyId: company.id,
            minKm: r.minKm,
            maxKm: r.maxKm,
            price: r.price,
          })),
        }),
      ]);
    }

    const fresh = await this.prisma.company.findUnique({
      where: { id: company.id },
      include: {
        logo: true,
        distanceRates: { orderBy: { minKm: 'asc' } },
      },
    });
    return this.serialize(fresh);
  }

  async uploadLogo(companyId: string, filename: string) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, isDeleted: false },
    });
    if (!company) throw new NotFoundException('Company not found');

    // Remove previous logo
    const existing = await this.prisma.file.findUnique({
      where: { companyId: company.id },
    });
    if (existing) {
      const oldPath = path.join(
        process.cwd(),
        'uploads',
        'logos',
        existing.filename,
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await this.prisma.file.delete({ where: { id: existing.id } });
    }

    const file = await this.prisma.file.create({
      data: {
        filename,
        path: filename,
        url: `/uploads/logos/${filename}`,
        mimeType: 'image/*',
        size: 0,
        companyId: company.id,
      },
    });

    return { logo: file.url };
  }

  async deleteLogo(companyId: string) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, isDeleted: false },
    });
    if (!company) throw new NotFoundException('Company not found');

    const file = await this.prisma.file.findUnique({
      where: { companyId: company.id },
    });
    if (!file) throw new NotFoundException('No logo found to delete');

    const logoPath = path.join(
      process.cwd(),
      'uploads',
      'logos',
      file.filename,
    );
    if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);

    await this.prisma.file.delete({ where: { id: file.id } });

    return { message: 'Logo deleted successfully', logo: '' };
  }
}
