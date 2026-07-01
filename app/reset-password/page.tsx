import { AuthPage } from '@/components/auth-page';
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <AuthPage mode="reset" resetToken={token} />;
}
