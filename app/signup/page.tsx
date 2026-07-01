import { AuthPage } from '@/components/auth-page';
export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
	const { ref } = await searchParams;
	return (
		<AuthPage
			mode="signup"
			referralCode={ref}
		/>
	);
}
