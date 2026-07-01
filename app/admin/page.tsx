import { AdminShell } from "@/components/admin-shell";
import { AdminDashboard } from "@/components/admin-pages";
export const dynamic = 'force-dynamic';
export default function Page(){ return <AdminShell><AdminDashboard/></AdminShell> }
