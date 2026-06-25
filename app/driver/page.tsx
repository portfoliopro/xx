import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import DriverDashboardClient from '@/components/driver/driver-dashboard-client'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DriverDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'driver') redirect('/')

  const { data: availableOrders } = await supabase
    .from('orders')
    .select('*, business:businesses(name, city, address), order_items(id)')
    .eq('status', 'ready')
    .is('driver_id', null)
    .order('created_at', { ascending: false })

  const { data: myOrders } = await supabase
    .from('orders')
    .select('*, business:businesses(name, city), customer:profiles!customer_id(full_name, phone)')
    .eq('driver_id', user.id)
    .in('status', ['picked_up', 'confirmed', 'preparing', 'ready'])
    .order('updated_at', { ascending: false })

  const { data: history } = await supabase
    .from('orders')
    .select('*, business:businesses(name)')
    .eq('driver_id', user.id)
    .in('status', ['delivered', 'cancelled'])
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <DriverDashboardClient
        profile={profile as Profile}
        availableOrders={availableOrders ?? []}
        myOrders={myOrders ?? []}
        history={history ?? []}
        userId={user.id}
      />
      <Footer />
    </main>
  )
}
