'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Package, CheckCircle, Clock, Truck, Store, AlertCircle } from 'lucide-react'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/lib/types'
import Link from 'next/link'

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered']

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Store,
  ready: Package,
  picked_up: Truck,
  delivered: CheckCircle,
  cancelled: AlertCircle,
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-orange-100 text-orange-700 border-orange-200',
  ready: 'bg-purple-100 text-purple-700 border-purple-200',
  picked_up: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

interface TrackingViewProps {
  order: Order & { order_items?: Array<{ product?: { name: string }; quantity: number }> }
}

export default function TrackingView({ order: initialOrder }: TrackingViewProps) {
  const supabase = createClient()
  const [order, setOrder] = useState(initialOrder)

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [order.id, supabase])

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as OrderStatus)
  const isCancelled = order.status === 'cancelled'
  const StatusIcon = STATUS_ICONS[order.status as OrderStatus] ?? Clock

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">رمز التتبع</p>
            <p className="text-2xl font-mono font-black text-primary tracking-widest">{order.tracking_code}</p>
          </div>
          <Badge className={`border font-semibold px-3 py-1 text-sm ${STATUS_COLORS[order.status as OrderStatus]}`}>
            <StatusIcon className="w-4 h-4 ml-1" />
            {ORDER_STATUS_LABELS[order.status as OrderStatus]}
          </Badge>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Progress Steps */}
        {!isCancelled && (
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex
              const Icon = STATUS_ICONS[step]
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-medium text-center max-w-[52px] leading-tight ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                      {ORDER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <Separator />

        {/* Order info */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {order.business && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">المشروع</p>
              <Link href={`/businesses/${order.business.id}`} className="font-semibold text-primary hover:underline flex items-center gap-1">
                <Store className="w-4 h-4" />
                {order.business.name}
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">عنوان التوصيل</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              {order.delivery_address}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
            <p className="font-medium">{new Date(order.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">الإجمالي</p>
            <p className="font-bold text-primary text-lg">مجاني</p>
          </div>
        </div>

        {/* Items */}
        {order.order_items && order.order_items.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-bold mb-3">المنتجات المطلوبة</p>
              <div className="flex flex-col gap-2">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-secondary/40 rounded-xl px-4 py-2.5">
                    <span className="font-medium">{item.product?.name ?? 'منتج'}</span>
                    <Badge variant="secondary" className="font-bold">×{item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {order.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
              <p className="text-sm text-foreground">{order.notes}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
