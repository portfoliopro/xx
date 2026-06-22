import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold">وصلني</span>
            </Link>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              منصة تربط أصحاب المشاريع المنزلية بالعملاء المحليين — بسهولة وأمان.
            </p>
          </div>

          {/* للعملاء */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm">للعملاء</h4>
            <nav className="flex flex-col gap-2 text-sm text-sidebar-foreground/70">
              <Link href="/products" className="hover:text-sidebar-foreground transition-colors">تصفح المنتجات</Link>
              <Link href="/businesses" className="hover:text-sidebar-foreground transition-colors">المشاريع</Link>
              <Link href="/track" className="hover:text-sidebar-foreground transition-colors">تتبع الطلب</Link>
              <Link href="/customer" className="hover:text-sidebar-foreground transition-colors">طلباتي</Link>
            </nav>
          </div>

          {/* للمشاريع */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm">للمشاريع المنزلية</h4>
            <nav className="flex flex-col gap-2 text-sm text-sidebar-foreground/70">
              <Link href="/auth/sign-up?role=seller" className="hover:text-sidebar-foreground transition-colors">سجّل مشروعك</Link>
              <Link href="/seller" className="hover:text-sidebar-foreground transition-colors">لوحة البائع</Link>
            </nav>
          </div>

          {/* للسائقين */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm">للسائقين</h4>
            <nav className="flex flex-col gap-2 text-sm text-sidebar-foreground/70">
              <Link href="/auth/sign-up?role=driver" className="hover:text-sidebar-foreground transition-colors">انضم كسائق</Link>
              <Link href="/driver" className="hover:text-sidebar-foreground transition-colors">لوحة السائق</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-sidebar-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sidebar-foreground/50">
          <p>© {new Date().getFullYear()} وصلني — جميع الحقوق محفوظة.</p>
          <p>مصنوع بـ ♥ في المملكة العربية السعودية</p>
        </div>
      </div>
    </footer>
  )
}
