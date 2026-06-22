'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)
    if (error) {
      toast.error('خطأ في تسجيل الدخول: ' + error.message)
      return
    }
    // Redirect based on role
    const role = data.user?.user_metadata?.role ?? 'customer'
    const redirectMap: Record<string, string> = {
      customer: '/customer',
      seller: '/seller',
      driver: '/driver',
      admin: '/admin',
    }
    toast.success('أهلاً بك!')
    router.push(redirectMap[role] ?? '/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-black text-foreground">تسجيل الدخول</h1>
          <p className="text-sm text-muted-foreground">أهلاً بك في وصلني</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
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
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                dir="ltr"
                className="text-left pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold text-base h-11 rounded-xl mt-1">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          ليس لديك حساب؟{' '}
          <Link href="/auth/sign-up" className="text-primary font-semibold hover:underline">
            سجّل الآن
          </Link>
        </p>
        <p className="text-center mt-3">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </div>
  )
}
