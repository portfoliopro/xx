export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import DriverDashboardClient from '@/components/driver/driver-dashboard-client'
import type { Profile } from '@/lib/types'

export default async function DriverDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'driver') redirect('/')

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <DriverDashboardClient
        profile={profile as Profile}
        availableOrders={[]}
        myOrders={[]}
        history={[]}
        userId={user.id}
      />
      <Footer />
    </main>
  )
}
