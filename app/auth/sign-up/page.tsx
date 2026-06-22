'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Role } from '@/lib/types'

const roleOptions: { value: Role; label: string; desc: string; icon: string }[] = [
  { value: 'customer', label: 'عميل', desc: 'أتصفح وأطلب', icon: '🛍️' },
  { value: 'seller', label: 'صاحب مشروع', desc: 'عندي مشروع منزلي', icon: '🏠' },
  { value: 'driver', label: 'سائق توصيل', desc: 'أريد التوصيل', icon: '🚗' },
]

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const defaultRole = (searchParams.get('role') as Role) ?? 'customer'
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: defaultRole,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
        },
      },
    })
    setLoading(false)
    if (error) {
      toast.error('خطأ: ' + error.message)
      return
    }
    toast.success('تم إرسال رابط التحقق إلى بريدك!')
    router.push('/auth/sign-up-success')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground">إنشاء حساب جديد</h1>
          <p className="text-sm text-muted-foreground">انضم إلى مجتمع وصلني</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <Label>نوع الحساب</Label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                    form.role === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/40 text-muted-foreground'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input
              id="full_name"
              placeholder="محمد عبدالله"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">رقم الجوال (اختياري)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="05xxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="٦ أحرف على الأقل"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              dir="ltr"
              className="text-left"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold text-base h-11 rounded-xl mt-1">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إنشاء الحساب'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}
