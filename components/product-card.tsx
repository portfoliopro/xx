import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ShoppingCart, Store } from 'lucide-react'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = product.slug ? `/products/${product.slug}` : `/products/${product.id}`

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link href={href} className="relative block aspect-[4/3] bg-muted overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        {/* Free badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-primary-foreground font-bold text-xs px-2 py-0.5 rounded-full">
            مجاني
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {product.business && (
          <Link
            href={`/businesses/${product.business.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
          >
            <Store className="w-3 h-3" />
            {product.business.name}
          </Link>
        )}

        <Link href={href}>
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-black text-primary">مجاني</span>
          <Link href={href} className={buttonVariants({ size: 'sm' }) + ' rounded-xl text-xs font-bold px-4'}>اطلب الآن</Link>
        </div>
      </div>
    </div>
  )
}
