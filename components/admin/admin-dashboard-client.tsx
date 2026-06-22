'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  ShieldCheck, Users, ShoppingBag, Store, Package,
  CheckCircle, XCircle, BarChart3, AlertTriangle,
} from 'lucide-react'
import type { Order, Business, Profile } from '@/lib/types'
import { ORDER_STATUS_LABELS } from '@/lib/types'
import { ORDER_STATUS_COLORS } from '@/lib/status-colors'

const ROLE_LABELS: Record<string, string> = {
  customer: 'عميل',
  seller: 'بائع',
  driver: 'سائق',
  admin: 'مدير',
}

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700 border-blue-200',
  seller: 'bg-orange-100 text-orange-700 border-orange-200',
  driver: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-red-100 text-red-700 border-red-200',
}

interface Props {
  profile: Profile
  orders: Order[]
  businesses: Business[]
  users: Profile[]
  productCount: number
}

export default function AdminDashboardClient({
  profile,
  orders: initialOrders,
  businesses: initialBusinesses,
  users: initialUsers,
  productCount,
}: Props) {
  const supabase = createClient()
  const [orders, setOrders] = useState(initialOrders)
  const [businesses, setBusinesses] = useState(initialBusinesses)
  const [users, setUsers] = useState(initialUsers)

  const stats = {
    orders: orders.length,
    businesses: businesses.length,
    users: users.length,
    products: productCount,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    activeBusinesses: businesses.filter((b) => b.is_active).length,
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (error) { toast.error('فشل تحديث الحالة'); return }
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: status as Order['status'] } : o)))
    toast.success('تم تحديث حالة الطلب')
  }

  async function toggleBusiness(id: string, current: boolean) {
    const { error } = await supabase.from('businesses').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error('فشل التحديث'); return }
    setBusinesses(businesses.map((b) => (b.id === id ? { ...b, is_active: !current } : b)))
    toast.success(current ? 'تم إيقاف المشروع' : 'تم تفعيل المشروع')
  }

  async function changeUserRole(userId: string, role: string) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) { toast.error('فشل تغيير الدور'); return }
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: role as Profile['role'] } : u)))
    toast.success('تم تغيير دور المستخدم')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-black text-foreground">لوحة الإدارة</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            مرحباً {profile.full_name} — تحكم كامل بالمنصة
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي الطلبات', value: stats.orders, icon: ShoppingBag, sub: `${stats.pendingOrders} طلب جديد` },
          { label: 'المشاريع المنزلية', value: stats.businesses, icon: Store, sub: `${stats.activeBusinesses} نشط` },
          { label: 'المستخدمون', value: stats.users, icon: Users, sub: 'عملاء وبائعين وسائقين' },
          { label: 'المنتجات', value: stats.products, icon: Package, sub: 'في المنصة' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              {s.label === 'إجمالي الطلبات' && stats.pendingOrders > 0 && (
                <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-primary/70 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="orders" className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            الطلبات
            {stats.pendingOrders > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {stats.pendingOrders}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-1.5">
            <Store className="w-4 h-4" />
            المشاريع
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            المستخدمون
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            نظرة عامة
          </TabsTrigger>
        </TabsList>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <div className="flex flex-col gap-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">لا توجد طلبات</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-primary tracking-widest text-sm">
                        {order.tracking_code}
                      </span>
                      <Badge className={`text-xs border ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <span className="text-muted-foreground">
                        العميل:{' '}
                        <span className="font-medium text-foreground">
                          {(order as any).customer?.full_name ?? ('—' as string)}
                        </span>
                      </span>
                      <Separator orientation="vertical" className="h-4 hidden sm:block" />
                      <span className="text-muted-foreground">
                        المشروع:{' '}
                        <span className="font-medium text-foreground">
                          {(order as any).business?.name ?? '—'}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{order.delivery_address}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('ar-SA', {
                        dateStyle: 'medium',
                      })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                      <SelectTrigger className="w-44 rounded-xl text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* BUSINESSES TAB */}
        <TabsContent value="businesses">
          <div className="flex flex-col gap-3">
            {businesses.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">لا توجد مشاريع</p>
              </div>
            ) : (
              businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{biz.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(biz as any).owner?.full_name ?? '—'} · {biz.city ?? '—'} · {biz.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(biz.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs hidden sm:flex ${biz.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}
                    >
                      {biz.is_active ? 'نشط' : 'موقوف'}
                    </Badge>
                    <Button
                      size="sm"
                      variant={biz.is_active ? 'outline' : 'default'}
                      className="rounded-xl text-xs gap-1.5"
                      onClick={() => toggleBusiness(biz.id, biz.is_active)}
                    >
                      {biz.is_active ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          تفعيل
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <div className="flex flex-col gap-3">
            {users.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">لا يوجد مستخدمون</p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {u.full_name?.charAt(0) ?? 'م'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {u.full_name ?? 'مستخدم'}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.phone ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {u.id === profile.id ? (
                      <Badge className="border bg-red-100 text-red-700 border-red-200 text-xs gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        أنت
                      </Badge>
                    ) : (
                      <Select value={u.role} onValueChange={(v) => changeUserRole(u.id, v)}>
                        <SelectTrigger className="w-32 rounded-xl text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Order status breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                توزيع الطلبات
              </h3>
              <div className="flex flex-col gap-3">
                {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => {
                  const count = orders.filter((o) => o.status === status).length
                  const pct = orders.length ? Math.round((count / orders.length) * 100) : 0
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge
                        className={`text-xs border w-24 justify-center shrink-0 ${ORDER_STATUS_COLORS[status]}`}
                      >
                        {label}
                      </Badge>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 shrink-0 text-left">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* User roles breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                توزيع المستخدمين
              </h3>
              <div className="flex flex-col gap-3">
                {Object.entries(ROLE_LABELS).map(([role, label]) => {
                  const count = users.filter((u) => u.role === role).length
                  const pct = users.length ? Math.round((count / users.length) * 100) : 0
                  return (
                    <div key={role} className="flex items-center gap-3">
                      <Badge className={`text-xs border w-20 justify-center shrink-0 ${ROLE_COLORS[role]}`}>
                        {label}
                      </Badge>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 shrink-0 text-left">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Alert for pending orders */}
            {stats.pendingOrders > 0 && (
              <div className="sm:col-span-2 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-yellow-800">
                    يوجد {stats.pendingOrders} طلب في الانتظار
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    يرجى مراجعة الطلبات الجديدة وتحديث حالتها من تبويب الطلبات.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
