// app/products/[slug]/page.tsx

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import OrderForm from '@/components/order-form'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin, Store } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface Props {
  params: { slug: string }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = params
  const supabase = await createClient()

  /* ======================
     Auth + Profile
  ====================== */
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

  /* ======================
     Product (by slug)
  ====================== */
  let { data: product } = await supabase
    .from('products')
    .select('*, business:businesses(*)')
    .eq('slug', slug)
    .single()

  /* ======================
     Fallback (by id)
  ====================== */
  if (!product) {
    const { data } = await supabase
      .from('products')
      .select('*, business:businesses(*)')
      .eq('id', slug)
      .single()

    product = data
  }

  if (!product) return notFound()

  /* ======================
     UI
  ====================== */
  return (
    <main>
      <Navbar />

      <div className="container py-10 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground flex gap-2">
          <Link href="/" className="hover:text-primary">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">
            المنتجات
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-sm">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl">
                🍱
              </div>
            )}

            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground font-bold">
                مجاني
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {product.business && (
              <Link
                href={`/businesses/${product.business.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary w-fit"
              >
                <Store className="w-4 h-4" />
                {product.business.name}
                {product.business.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {product.business.city}
                  </span>
                )}
              </Link>
            )}

            <h1 className="text-3xl font-black">{product.name}</h1>

            {product.category && (
              <Badge variant="secondary" className="w-fit">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </Badge>
            )}

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary">مجاني</span>
              <span className="text-sm text-muted-foreground line-through">
                0 ريال
              </span>
            </div>

            {/* Order Form */}
            <div className="bg-secondary/40 rounded-2xl p-5 border">
              <h2 className="font-bold mb-4">اطلب هذا المنتج</h2>
              <OrderForm product={product} user={user} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
