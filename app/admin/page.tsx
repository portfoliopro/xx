import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import AdminDashboardClient from '@/components/admin/admin-dashboard-client'
import type { Profile } from '@/lib/types'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // المستخدم
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // البروفايل
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  // جلب البيانات بالتوازي
  const [
    { data: allOrders },
    { data: allBusinesses },
    { data: allUsers },
    { count: productCount },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        business:businesses(name),
        customer:profiles!orders_customer_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50),

    supabase
      .from('businesses')
      .select(`
        *,
        owner:profiles!businesses_owner_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false }),

    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false }),

    supabase
      .from('products')
      .select('*', { count: 'exact', head: true }),
  ])

  return (
    <>
      <Navbar profile={profile as Profile} />

      <AdminDashboardClient
        profile={profile as Profile}
        orders={allOrders ?? []}
        businesses={allBusinesses ?? []}
        users={allUsers ?? []}
        productCount={productCount ?? 0}
      />
    </>
  )
}
