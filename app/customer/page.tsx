import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag, MapPin, Clock, ArrowLeft } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/status-colors'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, business:businesses(name, city), order_items(id)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const stats = {
    total: orders?.length ?? 0,
    active: orders?.filter(o => !['delivered', 'cancelled'].includes(o.status)).length ?? 0,
    delivered: orders?.filter(o => o.status === 'delivered').length ?? 0,
  }

  return (
    <main className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-heading font-black text-foreground">
              أهلاً، {profile.full_name ?? 'عزيزي العميل'} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">هنا تجد جميع طلباتك</p>
          </div>
          <Link href="/products" className={buttonVariants() + ' rounded-xl gap-2'}>
            <ShoppingBag className="w-4 h-4" />
            طلب جديد
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'إجمالي الطلبات', value: stats.total, icon: ShoppingBag },
            { label: 'طلبات نشطة', value: stats.active, icon: Clock },
            { label: 'تم التوصيل', value: stats.delivered, icon: MapPin },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        <h2 className="text-lg font-bold text-foreground mb-4">طلباتي</h2>
        {(!orders || orders.length === 0) ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">لا توجد طلبات بعد</p>
            <Link href="/products" className={buttonVariants() + ' mt-4 rounded-xl'}>ابدأ التسوق</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-primary text-sm tracking-widest">{order.tracking_code}</span>
                    <Badge className={`text-xs border ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ?? ''}`}>
                      {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{order.business?.name ?? 'مشروع'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{order.delivery_address}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </p>
                </div>
                <Link href={`/track?code=${order.tracking_code}`} className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' shrink-0 rounded-xl gap-1'}>
                  تتبع
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
