import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import OrderForm from '@/components/order-form'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { MapPin, Store, ArrowRight, CreditCard } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Try by slug first, then by id
  let { data: product } = await supabase
    .from('products')
    .select('*, business:businesses(*)')
    .eq('slug', slug)
    .single()

  if (!product) {
    const { data } = await supabase
      .from('products')
      .select('*, business:businesses(*)')
      .eq('id', slug)
      .single()
    product = data
  }

  if (!product) return notFound()

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href="/products" className="hover:text-foreground">المنتجات</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-foreground font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-sm">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl">🍱</div>
            )}
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground font-bold px-3 py-1 text-sm rounded-full">
                مجاني
              </Badge>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {product.business && (
              <Link
                href={`/businesses/${product.business.id}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
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

            <h1 className="text-3xl font-heading font-black text-foreground text-balance">{product.name}</h1>

            {product.category && (
              <Badge variant="secondary" className="w-fit">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </Badge>
            )}

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary">مجاني</span>
              <span className="text-sm text-muted-foreground line-through">0 ريال</span>
            </div>

            {/* Payment link (Gumroad, etc.) if the admin has set one */}
            {product.payment_link && (
              <a
                href={product.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline' }) + ' w-full h-11 rounded-xl font-bold gap-2'}
              >
                <CreditCard className="w-4 h-4" />
                الدفع عبر الرابط الخاص بالمنتج
              </a>
            )}

            {/* Order Form */}
            <div className="bg-secondary/40 rounded-2xl p-5 border border-border">
              <h2 className="font-bold text-base mb-4">اطلب هذا المنتج</h2>
              <OrderForm product={product} user={user} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
