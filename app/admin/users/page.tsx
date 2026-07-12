import { AdminShell } from '@/components/admin-shell';
import { AdminUsers } from '@/components/admin-pages';
export default function Page() {
	return (
		<AdminShell>
			<AdminUsers />
		</AdminShell>
	);
}
