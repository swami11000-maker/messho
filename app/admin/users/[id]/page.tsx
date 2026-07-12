import UserAdminPanel from '@/components/user'
import { AdminShell } from '@/components/admin-shell'
import React from 'react'

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: userId } = await params
     
  return (
    <AdminShell>
      <UserAdminPanel userId={userId} />
    </AdminShell>
  )
}

export default page
