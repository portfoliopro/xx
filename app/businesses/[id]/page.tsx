import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import ProductCard from '@/components/product-card'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, ArrowRight } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BusinessDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const { data: business } = await supabase.from('businesses').select('*').eq('id', id).single()
  if (!business) return notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, business:businesses(*)')
    .eq('business_id', id)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link href="/businesses" className="hover:text-foreground">المشاريع</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-foreground font-medium">{business.name}</span>
        </nav>

        {/* Business Header */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
          <div className="relative h-48 bg-secondary">
            {business.cover_url ? (
              <Image src={business.cover_url} alt={business.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-6xl">🏠</div>
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-card border-4 border-card shadow-lg overflow-hidden shrink-0">
                {business.logo_url ? (
                  <Image src={business.logo_url} alt={business.name} width={80} height={80} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-3xl">🏡</div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-heading font-black text-foreground">{business.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <Badge variant="secondary">{CATEGORY_LABELS[business.category] ?? business.category}</Badge>
                  {business.city && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />{business.city}
                    </span>
                  )}
                  {business.phone && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />{business.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {business.description && (
              <p className="text-muted-foreground leading-relaxed">{business.description}</p>
            )}
          </div>
        </div>

        {/* Products */}
        <h2 className="text-xl font-heading font-bold text-foreground mb-5">منتجات المشروع</h2>
        {(!products || products.length === 0) ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
            <p className="text-2xl mb-2">📦</p>
            <p className="font-medium">لا توجد منتجات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
