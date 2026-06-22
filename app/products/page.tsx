import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import type { Profile, Product } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import Link from 'next/link'

interface Props {
  searchParams: {
    category?: string
    q?: string
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const supabase = await createClient()

  // المستخدم (اختياري)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
  }

  // استعلام المنتجات
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.q) {
    query = query.ilike('name', `%${searchParams.q}%`)
  }

  const { data: products } = await query

  const categories = Object.entries(CATEGORY_LABELS)

  return (
    <main>
      <Navbar profile={profile} />

      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">كل المنتجات</h1>
        <p className="text-muted-foreground mb-8">
          جميع منتجات المشاريع المنزلية — كلها مجانية وبتوصيل سريع
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/products">
            <Badge
              variant={!searchParams.category ? 'default' : 'secondary'}
              className="cursor-pointer text-sm px-4 py-1.5 rounded-full"
            >
              الكل
            </Badge>
          </Link>

          {categories.map(([key, label]) => (
            <Link key={key} href={`/products?category=${key}`}>
              <Badge
                variant={
                  searchParams.category === key ? 'default' : 'secondary'
                }
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
            <p className="text-lg font-medium">
              لا توجد منتجات في هذه الفئة
            </p>
            <p className="text-sm mt-1">
              جرّب فئة أخرى أو تحقق لاحقاً
            </p>
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
