import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import SellerDashboardClient from '@/components/seller/seller-dashboard-client'
import type { Profile } from '@/lib/types'

export default async function SellerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'seller') redirect('/')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  const { data: products } = business
    ? await supabase.from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false })
    : { data: [] }

  // نجلب الطلبات بدون تضمين (embed) علاقات — لتجنّب فشل الاستعلام كاملاً
  // إذا كانت الـ Foreign Keys بين الجداول غير معروفة لـ PostgREST.
  // نجمع order_items والعميل والمنتج بطلبات منفصلة، ونربطهم يدوياً.
  const { data: ordersRaw, error: ordersError } = business
    ? await supabase
        .from('orders')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [], error: null }

  if (ordersError) console.error('[seller] orders fetch error:', ordersError)

  const orderIds = (ordersRaw ?? []).map((o) => o.id)
  const customerIds = Array.from(new Set((ordersRaw ?? []).map((o) => o.customer_id).filter(Boolean)))

  const [{ data: itemsRaw }, { data: customersRaw }] = await Promise.all([
    orderIds.length
      ? supabase.from('order_items').select('*').in('order_id', orderIds)
      : Promise.resolve({ data: [] as any[] }),
    customerIds.length
      ? supabase.from('profiles').select('id, full_name, phone').in('id', customerIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const productIds = Array.from(new Set((itemsRaw ?? []).map((it: any) => it.product_id).filter(Boolean)))
  const { data: itemProducts } = productIds.length
    ? await supabase.from('products').select('id, name').in('id', productIds)
    : { data: [] as any[] }

  const productsById = new Map((itemProducts ?? []).map((p: any) => [p.id, p]))
  const customersById = new Map((customersRaw ?? []).map((c: any) => [c.id, c]))
  const itemsByOrder = new Map<string, any[]>()
  for (const it of itemsRaw ?? []) {
    const withProduct = { ...it, product: productsById.get(it.product_id) }
    const arr = itemsByOrder.get(it.order_id) ?? []
    arr.push(withProduct)
    itemsByOrder.set(it.order_id, arr)
  }

  const orders = (ordersRaw ?? []).map((o) => ({
    ...o,
    order_items: itemsByOrder.get(o.id) ?? [],
    customer: customersById.get(o.customer_id) ?? null,
  }))

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <SellerDashboardClient
        profile={profile as Profile}
        business={business}
        products={products ?? []}
        orders={orders ?? []}
        userId={user.id}
      />
      <Footer />
    </main>
  )
}
