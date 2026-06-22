import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import TrackingView from '@/components/tracking-view'
import TrackSearch from '@/components/track-search'
import type { Profile } from '@/lib/types'

interface Props {
  searchParams: Promise<{ code?: string }>
}

export default async function TrackPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  let order = null
  if (params.code) {
    const { data } = await supabase
      .from('orders')
      .select('*, business:businesses(*), order_items(*, product:products(*))')
      .eq('tracking_code', params.code.toUpperCase())
      .single()
    order = data
  }

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-black text-foreground mb-2">تتبع طلبك</h1>
          <p className="text-muted-foreground">أدخل رمز التتبع الخاص بطلبك</p>
        </div>

        <Suspense>
          <TrackSearch defaultCode={params.code} />
        </Suspense>

        {order && (
          <div className="mt-8">
            <TrackingView order={order} />
          </div>
        )}

        {params.code && !order && (
          <div className="mt-8 text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-semibold text-foreground">لم يتم العثور على الطلب</p>
            <p className="text-muted-foreground text-sm mt-1">تأكد من رمز التتبع وحاول مرة أخرى</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
