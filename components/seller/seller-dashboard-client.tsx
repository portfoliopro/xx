'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Package, ShoppingBag, Store, Loader2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Business, Product, Order, Profile } from '@/lib/types'
import { CATEGORY_LABELS, ORDER_STATUS_LABELS } from '@/lib/types'
import { ORDER_STATUS_COLORS } from '@/lib/status-colors'
import { useRouter } from 'next/navigation'

interface Props {
  profile: Profile
  business: Business | null
  products: Product[]
  orders: Order[]
  userId: string
}

export default function SellerDashboardClient({ profile, business: initialBusiness, products: initialProducts, orders: initialOrders, userId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [business, setBusiness] = useState(initialBusiness)
  const [products, setProducts] = useState(initialProducts)
  const [orders, setOrders] = useState(initialOrders)
  const [savingBiz, setSavingBiz] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [bizForm, setBizForm] = useState({
    name: initialBusiness?.name ?? '',
    description: initialBusiness?.description ?? '',
    city: initialBusiness?.city ?? '',
    address: initialBusiness?.address ?? '',
    phone: initialBusiness?.phone ?? '',
    category: initialBusiness?.category ?? 'food',
  })
  const [productForm, setProductForm] = useState({
    name: '', description: '', category: 'food', image_url: '',
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  async function saveBusiness() {
    setSavingBiz(true)
    if (business) {
      const { error } = await supabase.from('businesses').update(bizForm).eq('id', business.id)
      if (error) { toast.error('فشل التحديث: ' + error.message); setSavingBiz(false); return }
      setBusiness({ ...business, ...bizForm })
      toast.success('تم تحديث بيانات المشروع')
    } else {
      const { data, error } = await supabase.from('businesses').insert({ ...bizForm, owner_id: userId }).select().single()
      if (error) { toast.error('فشل الإنشاء: ' + error.message); setSavingBiz(false); return }
      setBusiness(data)
      toast.success('تم إنشاء مشروعك!')
    }
    setSavingBiz(false)
    router.refresh()
  }

  async function addProduct() {
    if (!business) { toast.error('يجب إنشاء المشروع أولاً'); return }
    if (!productForm.name.trim()) { toast.error('اسم المنتج مطلوب'); return }
    setSavingProduct(true)
    const slug = `${productForm.name.trim().toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    const { data, error } = await supabase
      .from('products')
      .insert({ ...productForm, business_id: business.id, price: 0, slug, image_url: productForm.image_url || null })
      .select()
      .single()
    setSavingProduct(false)
    if (error) { toast.error('فشل إضافة المنتج: ' + error.message); return }
    setProducts([data, ...products])
    setProductForm({ name: '', description: '', category: 'food', image_url: '' })
    toast.success('تم إضافة المنتج!')
  }

  async function toggleProduct(id: string, current: boolean) {
    const { error } = await supabase.from('products').update({ is_available: !current }).eq('id', id)
    if (error) { toast.error('فشل التحديث'); return }
    setProducts(products.map(p => p.id === id ? { ...p, is_available: !current } : p))
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { toast.error('فشل الحذف'); return }
    setProducts(products.filter(p => p.id !== id))
    toast.success('تم حذف المنتج')
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (error) { toast.error('فشل التحديث'); return }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
    toast.success('تم تحديث حالة الطلب')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-black text-foreground">
          لوحة البائع — {profile.full_name ?? 'مشروعك'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">أدر مشروعك ومنتجاتك وطلباتك</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'إجمالي الطلبات', value: stats.total, icon: ShoppingBag },
          { label: 'طلبات جديدة', value: stats.pending, icon: Package },
          { label: 'تم التوصيل', value: stats.delivered, icon: Store },
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

      <Tabs defaultValue={business ? 'orders' : 'business'}>
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="orders">الطلبات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="business">المشروع</TabsTrigger>
        </TabsList>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary tracking-widest text-sm">{order.tracking_code}</span>
                      <Badge className={`text-xs border ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{(order as any).customer?.full_name ?? 'عميل'}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.delivery_address}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</p>
                  </div>
                  <div className="shrink-0">
                    <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                      <SelectTrigger className="w-40 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PRODUCTS TAB */}
        <TabsContent value="products">
          {/* Add product form */}
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              إضافة منتج جديد
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>اسم المنتج</Label>
                <Input placeholder="مثال: كبسة لحم" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>الفئة</Label>
                <Select value={productForm.category} onValueChange={v => setProductForm({ ...productForm, category: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>الوصف</Label>
                <Textarea placeholder="وصف المنتج..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={2} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>رابط صورة المنتج (اختياري)</Label>
                <Input placeholder="https://..." value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} dir="ltr" className="text-left" />
              </div>
            </div>
            <Button onClick={addProduct} disabled={savingProduct} className="mt-4 rounded-xl gap-2">
              {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              إضافة المنتج
            </Button>
          </div>

          {/* Products list */}
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">لا توجد منتجات بعد</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[product.category ?? 'general']}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={product.is_available ? 'default' : 'secondary'} className="text-xs">
                      {product.is_available ? 'متاح' : 'غير متاح'}
                    </Badge>
                    <button onClick={() => toggleProduct(product.id, product.is_available)} className="text-muted-foreground hover:text-primary">
                      {product.is_available ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* BUSINESS TAB */}
        <TabsContent value="business">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold mb-5 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {business ? 'تعديل بيانات المشروع' : 'إنشاء مشروعك'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>اسم المشروع</Label>
                <Input placeholder="مثال: مطبخ أم عبدالله" value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>الفئة</Label>
                <Select value={bizForm.category} onValueChange={v => setBizForm({ ...bizForm, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>المدينة</Label>
                <Input placeholder="مثال: الرياض" value={bizForm.city} onChange={e => setBizForm({ ...bizForm, city: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>العنوان</Label>
                <Input placeholder="العنوان التفصيلي" value={bizForm.address} onChange={e => setBizForm({ ...bizForm, address: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>رقم الجوال</Label>
                <Input placeholder="05xxxxxxxx" value={bizForm.phone} onChange={e => setBizForm({ ...bizForm, phone: e.target.value })} dir="ltr" className="text-left" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>الوصف</Label>
                <Textarea placeholder="اكتب وصفاً لمشروعك..." value={bizForm.description} onChange={e => setBizForm({ ...bizForm, description: e.target.value })} rows={3} />
              </div>
            </div>
            <Button onClick={saveBusiness} disabled={savingBiz} className="mt-5 rounded-xl px-8 gap-2">
              {savingBiz ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {business ? 'حفظ التغييرات' : 'إنشاء المشروع'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
