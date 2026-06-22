import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import type { Profile, Product } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  let query = supabase
    .from('products')
    .select('*, business:businesses(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (params.category) {
    query = query.eq('category', params.category)
  }
  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  const { data: products } = await query

  const categories = Object.entries(CATEGORY_LABELS)

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-heading font-black text-foreground mb-2">كل المنتجات</h1>
        <p className="text-muted-foreground mb-8">جميع منتجات المشاريع المنزلية — كلها مجانية وبتوصيل سريع</p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/products">
            <Badge
              variant={!params.category ? 'default' : 'secondary'}
              className="cursor-pointer text-sm px-4 py-1.5 rounded-full"
            >
              الكل
            </Badge>
          </Link>
          {categories.map(([key, label]) => (
            <Link key={key} href={`/products?category=${key}`}>
              <Badge
                variant={params.category === key ? 'default' : 'secondary'}
                className="cursor-pointer text-sm px-4 py-1.5 rounded-full"
              >
                {label}
              </Badge>
            </Link>
          ))}
        </div>

        {(products?.length ?? 0) === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-lg font-medium">لا توجد منتجات في هذه الفئة</p>
            <p className="text-sm mt-1">جرّب فئة أخرى أو تحقق لاحقاً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
