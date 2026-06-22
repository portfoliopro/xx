'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MapPin, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface OrderFormProps {
  product: Product
  user: User | null
}

export default function OrderForm({ product, user }: OrderFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    delivery_address: '',
    notes: '',
    quantity: 1,
  })

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm mb-3">يجب تسجيل الدخول للطلب</p>
        <a href="/auth/login" className={buttonVariants() + ' rounded-xl'}>تسجيل الدخول</a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.delivery_address.trim()) {
      toast.error('يرجى إدخال عنوان التوصيل')
      return
    }
    setLoading(true)
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user!.id,
          business_id: product.business_id,
          delivery_address: form.delivery_address,
          notes: form.notes || null,
          total_amount: 0,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order item
      const { error: itemError } = await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: form.quantity,
        unit_price: 0,
      })

      if (itemError) throw itemError

      toast.success(`تم إرسال طلبك! رمز التتبع: ${order.tracking_code}`)
      router.push(`/track?code=${order.tracking_code}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ'
      toast.error('فشل إرسال الطلب: ' + msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address" className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          عنوان التوصيل
        </Label>
        <Textarea
          id="address"
          placeholder="أدخل عنوانك التفصيلي..."
          value={form.delivery_address}
          onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
          rows={2}
          required
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1.5 w-28">
          <Label htmlFor="qty">الكمية</Label>
          <Input
            id="qty"
            type="number"
            min={1}
            max={20}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className="text-center"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea
          id="notes"
          placeholder="أي تعليمات خاصة..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-bold text-base gap-2">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            اطلب الآن — مجاناً
          </>
        )}
      </Button>
    </form>
  )
}
