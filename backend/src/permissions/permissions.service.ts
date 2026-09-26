import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions.catalog';
import { UserRole } from '@prisma/client';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== INIT ====================
  async onModuleInit() {
    await this.syncPermissions();
    await this.syncRolePermissions();
  }

  private async syncPermissions() {
    for (const p of PERMISSIONS) {
      await this.prisma.permission.upsert({
        where: { name: p.name },
        update: { description: p.description, group: p.group },
        create: p,
      });
    }
  }

  private async syncRolePermissions() {
    for (const [role, permNames] of Object.entries(ROLE_PERMISSIONS) as [
      UserRole,
      string[],
    ][]) {
      for (const permName of permNames) {
        const perm = await this.prisma.permission.findUnique({
          where: { name: permName },
        });
        if (!perm) continue;

        await this.prisma.rolePermission.upsert({
          where: {
            roleName_permissionId: { roleName: role, permissionId: perm.id },
          },
          update: {},
          create: { roleName: role, permissionId: perm.id },
        });
      }
    }
  }

  // ==================== CATALOG ====================
  async getCatalog() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
    const groups = [
      ...new Set(permissions.map((p) => p.group ?? 'other')),
    ].sort();
    return { permissions, groups };
  }

  // ==================== READ ====================
  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      include: { userPermissions: { include: { permission: true } } },
    });

    if (!user) throw new NotFoundException(`User with id ${userId} not found.`);

    const rolePermissions = (
      await this.prisma.rolePermission.findMany({
        where: { roleName: user.role },
        include: { permission: true },
      })
    ).map((rp) => rp.permission);

    const effectivePermissions = await this.resolveEffectivePermissions(
      user.id,
      user.role,
    );

    return {
      userId: user.id,
      role: user.role,
      rolePermissions,
      userPermissions: user.userPermissions.map((up) => ({
        ...up.permission,
        grantedAt: up.grantedAt,
        grantedById: up.grantedById,
        revokedAt: up.revokedAt,
      })),
      effectivePermissions,
    };
  }

  async resolveEffectivePermissions(
    userId: string,
    role?: UserRole,
  ): Promise<string[]> {
    const user =
      role !== undefined
        ? { id: userId, role }
        : await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
          });

    if (!user) return [];

    const [rolePerms, userPerms] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { roleName: user.role },
        include: { permission: true },
      }),
      this.prisma.userPermission.findMany({
        where: { userId, revokedAt: null },
        include: { permission: true },
      }),
    ]);

    const set = new Set<string>();
    for (const rp of rolePerms) set.add(rp.permission.name);
    for (const up of userPerms) set.add(up.permission.name);

    return [...set];
  }

  async userHasPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    const perms = await this.resolveEffectivePermissions(userId);
    return perms.includes(permission);
  }

  // ==================== MUTATIONS ====================
  async grantPermission(
    userId: string,
    permissionId: string,
    grantedById?: string,
  ) {
    await this.assertUserExists(userId);
    await this.assertPermissionExists(permissionId);

    await this.prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { revokedAt: null },
      create: { userId, permissionId, grantedById: grantedById ?? null },
    });

    return this.getUserPermissions(userId);
  }

  async revokePermission(userId: string, permissionId: string) {
    await this.assertUserExists(userId);
    await this.assertPermissionExists(permissionId);

    await this.prisma.userPermission.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { revokedAt: new Date() },
      create: { userId, permissionId, revokedAt: new Date() },
    });

    return this.getUserPermissions(userId);
  }

  async replaceUserPermissions(
    userId: string,
    permissionIds: string[],
    grantedById?: string,
  ) {
    await this.assertUserExists(userId);

    const perms = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true },
    });
    if (perms.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissionIds are invalid.');
    }

    await this.prisma.$transaction([
      this.prisma.userPermission.updateMany({
        where: {
          userId,
          revokedAt: null,
          permissionId: { notIn: permissionIds },
        },
        data: { revokedAt: new Date() },
      }),
      ...permissionIds.map((permissionId) =>
        this.prisma.userPermission.upsert({
          where: { userId_permissionId: { userId, permissionId } },
          update: { revokedAt: null },
          create: {
            userId,
            permissionId,
            grantedById: grantedById ?? null,
          },
        }),
      ),
    ]);

    return this.getUserPermissions(userId);
  }

  async grantRolePermissionsToUser(userId: string, grantedById?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found.`);

    const rolePerms = await this.prisma.rolePermission.findMany({
      where: { roleName: user.role },
    });

    for (const rp of rolePerms) {
      await this.prisma.userPermission.upsert({
        where: {
          userId_permissionId: { userId, permissionId: rp.permissionId },
        },
        update: { revokedAt: null },
        create: {
          userId,
          permissionId: rp.permissionId,
          grantedById: grantedById ?? null,
        },
      });
    }

    return this.getUserPermissions(userId);
  }

  // ==================== HELPERS ====================
  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { id: true },
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found.`);
  }

  private async assertPermissionExists(permissionId: string) {
    const perm = await this.prisma.permission.findUnique({
      where: { id: permissionId },
      select: { id: true },
    });
    if (!perm)
      throw new NotFoundException(
        `Permission with id ${permissionId} not found.`,
      );
  }
}
