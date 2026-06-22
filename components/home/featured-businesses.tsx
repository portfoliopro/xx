import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, ArrowLeft } from 'lucide-react'
import type { Business } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

interface FeaturedBusinessesProps {
  businesses: Business[]
}

export default function FeaturedBusinesses({ businesses }: FeaturedBusinessesProps) {
  return (
    <section className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">مشاريع مميزة</h2>
            <p className="text-muted-foreground text-sm mt-1">تعرف على أصحاب المشاريع المنزلية</p>
          </div>
          <Link href="/businesses" className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' hidden sm:flex gap-2'}>
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">لا توجد مشاريع بعد</p>
            <Link href="/auth/sign-up?role=seller" className={buttonVariants() + ' mt-4'}>سجّل مشروعك</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/businesses/${biz.id}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Cover */}
                <div className="relative h-32 bg-secondary overflow-hidden">
                  {biz.cover_url ? (
                    <Image src={biz.cover_url} alt={biz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  {/* Logo */}
                  <div className="absolute bottom-0 right-4 translate-y-1/2 w-14 h-14 rounded-xl bg-card border-2 border-card shadow-md overflow-hidden">
                    {biz.logo_url ? (
                      <Image src={biz.logo_url} alt={biz.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-2xl">🏡</div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-10 pb-4 px-4 flex flex-col gap-1.5">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{biz.name}</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[biz.category] ?? biz.category}
                    </Badge>
                    {biz.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {biz.city}
                      </span>
                    )}
                  </div>
                  {biz.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{biz.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
