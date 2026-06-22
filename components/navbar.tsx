'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type Profile } from '@/lib/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingBag, Menu, X, LogOut, LayoutDashboard, Truck, Store, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface NavbarProps {
  profile?: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('تم تسجيل الخروج')
    router.push('/')
    router.refresh()
  }

  const dashboardHref =
    profile?.role === 'driver'
      ? '/driver'
      : profile?.role === 'seller'
        ? '/seller'
        : profile?.role === 'admin'
          ? '/admin'
          : '/customer'

  const dashboardIcon =
    profile?.role === 'driver' ? (
      <Truck className="w-4 h-4" />
    ) : profile?.role === 'seller' ? (
      <Store className="w-4 h-4" />
    ) : profile?.role === 'admin' ? (
      <ShieldCheck className="w-4 h-4" />
    ) : (
      <LayoutDashboard className="w-4 h-4" />
    )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-heading font-bold text-foreground">وصلني</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            المنتجات
          </Link>
          <Link href="/businesses" className="text-muted-foreground hover:text-foreground transition-colors">
            المشاريع
          </Link>
          <Link href="/track" className="text-muted-foreground hover:text-foreground transition-colors">
            تتبع الطلب
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors outline-none">
                <span className="flex items-center gap-2 rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {profile.full_name?.charAt(0) ?? 'م'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">{profile.full_name ?? 'مستخدم'}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => router.push(dashboardHref)} className="flex items-center gap-2 cursor-pointer">
                  {dashboardIcon}
                  لوحة التحكم
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>دخول</Link>
              <Link href="/auth/sign-up" className={buttonVariants({ size: 'sm' })}>تسجيل</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-3">
          <Link href="/products" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            المنتجات
          </Link>
          <Link href="/businesses" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            المشاريع
          </Link>
          <Link href="/track" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            تتبع الطلب
          </Link>
          {profile ? (
            <>
              <Link href={dashboardHref} className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
                لوحة التحكم
              </Link>
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false) }}
                className="py-2 text-sm font-medium text-destructive text-right"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/sign-up" onClick={() => setMenuOpen(false)} className={buttonVariants({ size: 'sm' }) + ' flex-1 justify-center'}>تسجيل</Link>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' flex-1 justify-center'}>دخول</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
