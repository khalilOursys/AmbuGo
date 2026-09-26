import UserPermissionsManager from '@/components/permissions/UserPermissionsManager';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; role?: string }>;
}

export default async function UserPermissionsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { name, role } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <UserPermissionsManager userId={id} userName={name} userRole={role} />
    </div>
  );
}