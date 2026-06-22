import Link from 'next/link'
import Image from 'next/image'
import { buttonVariants } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-card">
      {/* Decorative warm background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/10 blur-3xl translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Side */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold w-fit">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              منصة المشاريع المنزلية
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-foreground leading-tight text-balance">
              طعام منزلي
              <br />
              <span className="text-primary">حقيقي وطازج</span>
              <br />
              على بابك
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              اكتشف أشهى المنتجات من مشاريع منزلية محلية — أطعمة، حلويات، مخبوزات وأكثر. اطلب الآن مع تتبع لحظي لطلبك.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className={buttonVariants({ size: 'lg' }) + ' text-base font-bold px-8 rounded-xl'}>
                تصفح المنتجات
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Link>
              <Link href="/track" className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' text-base font-semibold px-8 rounded-xl'}>
                <Search className="w-5 h-5 ml-2" />
                تتبع طلبك
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-2">
              {[
                { value: '+٢٠٠', label: 'مشروع نشط' },
                { value: '+١٢٠٠', label: 'طلب يومياً' },
                { value: '٤.٩★', label: 'تقييم المتجر' },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-xl font-black text-primary">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/hero-food.png"
                alt="منتجات منزلية طازجة"
                fill
                className="object-cover"
                priority
              />
              {/* Floating badge */}
              <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground">توصيل سريع</p>
                <p className="text-sm font-bold text-foreground">خلال ٣٠-٦٠ دقيقة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
