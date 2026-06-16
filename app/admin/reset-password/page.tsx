import AdminResetPasswordForm from "@/components/admin/AdminResetPasswordForm";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token = Array.isArray(resolvedSearchParams.token)
    ? resolvedSearchParams.token[0] || ""
    : resolvedSearchParams.token || "";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <AdminResetPasswordForm token={token} />
    </div>
  );
}
