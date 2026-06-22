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

  const { data: orders } = business
    ? await supabase
        .from('orders')
        .select('*, order_items(*, product:products(name)), customer:profiles!customer_id(full_name, phone)')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] }

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
