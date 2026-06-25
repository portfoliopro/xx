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

  // نجلب كل البيانات بدون تضمين (embed) علاقات بين الجداول — لتجنّب فشل
  // أي استعلام بالكامل إذا كانت الـ Foreign Keys غير معروفة لـ PostgREST.
  // بما أننا نجلب كل الـ profiles والمشاريع دفعة واحدة، نربط الأسماء يدوياً.
  const [
    { data: allOrdersRaw, error: ordersErr },
    { data: allBusinessesRaw, error: businessesErr },
    { data: allUsers },
    { data: allProductsRaw },
  ] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('businesses').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
  ])

  if (ordersErr) console.error('[admin] orders fetch error:', ordersErr)
  if (businessesErr) console.error('[admin] businesses fetch error:', businessesErr)

  const profilesById = new Map((allUsers ?? []).map((u) => [u.id, u]))
  const businessesById = new Map((allBusinessesRaw ?? []).map((b) => [b.id, b]))

  const allOrders = (allOrdersRaw ?? []).map((o) => ({
    ...o,
    business: businessesById.get(o.business_id)
      ? { name: businessesById.get(o.business_id)!.name }
      : null,
    customer: profilesById.get(o.customer_id)
      ? { full_name: profilesById.get(o.customer_id)!.full_name }
      : null,
  }))

  const allBusinesses = (allBusinessesRaw ?? []).map((b) => ({
    ...b,
    owner: profilesById.get(b.owner_id)
      ? { full_name: profilesById.get(b.owner_id)!.full_name }
      : null,
  }))

  const allProducts = (allProductsRaw ?? []).map((p) => ({
    ...p,
    business: businessesById.get(p.business_id)
      ? { name: businessesById.get(p.business_id)!.name }
      : null,
  }))

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <AdminDashboardClient
        profile={profile as Profile}
        orders={allOrders ?? []}
        businesses={allBusinesses ?? []}
        users={allUsers ?? []}
        products={allProducts ?? []}
      />
      <Footer />
    </main>
  )
}
