'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Truck, MapPin, Package, CheckCircle, Clock, Phone } from 'lucide-react'
import type { Order, Profile } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import { ORDER_STATUS_COLORS } from '@/lib/status-colors'

interface Props {
  profile: Profile
  availableOrders: Order[]
  myOrders: Order[]
  history: Order[]
  userId: string
}

export default function DriverDashboardClient({ profile, availableOrders: initialAvail, myOrders: initialMine, history: initialHistory, userId }: Props) {
  const supabase = createClient()
  const [availableOrders, setAvailableOrders] = useState(initialAvail)
  const [myOrders, setMyOrders] = useState(initialMine)
  const [history, setHistory] = useState(initialHistory)
  const [loading, setLoading] = useState<string | null>(null)

  // جلب البيانات من Supabase مباشرة
  const fetchOrders = useCallback(async () => {
    // الطلبات المتاحة
    const { data: avail } = await supabase
      .from('orders')
      .select('*, business:businesses(name, city, address), order_items(id)')
      .eq('status', 'ready')
      .is('driver_id', null)
      .order('created_at', { ascending: false })

    // طلباتي النشطة
    const { data: mine } = await supabase
      .from('orders')
      .select('*, business:businesses(name, city), customer:profiles!customer_id(full_name, phone)')
      .eq('driver_id', userId)
      .in('status', ['picked_up', 'confirmed', 'preparing', 'ready'])
      .order('updated_at', { ascending: false })

    // السجل
    const { data: hist } = await supabase
      .from('orders')
      .select('*, business:businesses(name)')
      .eq('driver_id', userId)
      .in('status', ['delivered', 'cancelled'])
      .order('updated_at', { ascending: false })
      .limit(20)

    if (avail !== null) setAvailableOrders(avail)
    if (mine !== null) setMyOrders(mine)
    if (hist !== null) setHistory(hist)
  }, [userId, supabase])

  // Realtime subscription — يتحدث تلقائياً عند أي تغيير على الطلبات
  useEffect(() => {
    const channel = supabase
      .channel('driver-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders, supabase])

  async function acceptOrder(orderId: string) {
    setLoading(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: userId, status: 'picked_up', updated_at: new Date().toISOString() })
      .eq('id', orderId)
    setLoading(null)
    if (error) {
      toast.error('فشل قبول الطلب')
      console.error(error)
      return
    }
    toast.success('تم قبول الطلب! في الطريق...')
    // fetchOrders سيُستدعى تلقائياً عبر Realtime
  }

  async function markDelivered(orderId: string) {
    setLoading(orderId)
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered', updated_at: new Date().toISOString() })
      .eq('id', orderId)
    setLoading(null)
    if (error) {
      toast.error('فشل التحديث')
      return
    }
    toast.success('تم تسليم الطلب بنجاح!')
  }

  const stats = {
    available: availableOrders.length,
    active: myOrders.length,
    done: history.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-black text-foreground">
          لوحة السائق — {profile.full_name ?? 'سائق'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">اقبل الطلبات وتتبع توصيلاتك</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'طلبات متاحة', value: stats.available, icon: Package },
          { label: 'طلبات نشطة', value: stats.active, icon: Truck },
          { label: 'توصيلات مكتملة', value: stats.done, icon: CheckCircle },
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

      <Tabs defaultValue="available">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="available">
            الطلبات المتاحة
            {availableOrders.length > 0 && (
              <span className="mr-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {availableOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">طلباتي النشطة</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        {/* Available Orders */}
        <TabsContent value="available">
          {availableOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">لا توجد طلبات متاحة حالياً</p>
              <p className="text-sm mt-1">ستظهر الطلبات الجاهزة للاستلام هنا</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {availableOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="font-mono font-bold text-primary tracking-widest text-sm">{order.tracking_code}</span>
                      <p className="font-semibold text-foreground mt-0.5">{(order as any).business?.name}</p>
                      {(order as any).business?.city && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {(order as any).business?.city}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 border text-xs shrink-0">جاهز للاستلام</Badge>
                  </div>
                  <Separator className="my-3" />
                  <p className="text-sm flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-medium text-foreground">{order.delivery_address}</span>
                  </p>
                  <Button
                    onClick={() => acceptOrder(order.id)}
                    disabled={loading === order.id}
                    className="w-full mt-4 rounded-xl font-bold gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    {loading === order.id ? 'جاري...' : 'قبول الطلب والتوجه'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Active Orders */}
        <TabsContent value="active">
          {myOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
              <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">لا توجد طلبات نشطة</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myOrders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="font-mono font-bold text-primary tracking-widest text-sm">{order.tracking_code}</span>
                      <p className="font-semibold text-foreground mt-0.5">{(order as any).business?.name}</p>
                    </div>
                    <Badge className={`text-xs border ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {order.delivery_address}
                    </p>
                    {(order as any).customer?.phone && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        {(order as any).customer.phone}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => markDelivered(order.id)}
                    disabled={loading === order.id}
                    className="w-full mt-4 rounded-xl font-bold gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {loading === order.id ? 'جاري...' : 'تأكيد التسليم'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
              <p className="font-medium">لا يوجد سجل بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-sm text-primary font-bold tracking-widest">{order.tracking_code}</span>
                    <p className="text-sm text-muted-foreground">{(order as any).business?.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.updated_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</p>
                  </div>
                  <Badge className={`text-xs border ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
