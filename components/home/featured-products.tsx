import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import ProductCard from '@/components/product-card'
import type { Product } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

interface FeaturedProductsProps {
  products: Product[]
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">أحدث المنتجات</h2>
            <p className="text-muted-foreground text-sm mt-1">منتجات طازجة من مشاريع منزلية قريبة منك</p>
          </div>
          <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' hidden sm:flex gap-2'}>
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">لا توجد منتجات حتى الآن</p>
            <p className="text-sm mt-2">كن أول من يضيف مشروعه!</p>
            <Link href="/auth/sign-up" className={buttonVariants() + ' mt-4'}>أبدأ مشروعك</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/products" className={buttonVariants({ variant: 'outline' })}>عرض جميع المنتجات</Link>
        </div>
      </div>
    </section>
  )
}
