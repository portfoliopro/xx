import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import AdminDashboardClient from '@/components/admin/admin-dashboard-client'
import type { Profile } from '@/lib/types'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  const [
    { data: allOrders },
    { data: allBusinesses },
    { data: allUsers },
    { count: productCount },
  ] = await Promise.all([
    supabase.from('orders').select('*, business:businesses(name), customer:profiles!customer_id(full_name)').order('created_at', { ascending: false }).limit(50),
    supabase.from('businesses').select('*, owner:profiles!owner_id(full_name)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
  ])

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <AdminDashboardClient
        profile={profile as Profile}
        orders={allOrders ?? []}
        businesses={allBusinesses ?? []}
        users={allUsers ?? []}
        productCount={productCount ?? 0}
      />
      <Footer />
    </main>
  )
}
