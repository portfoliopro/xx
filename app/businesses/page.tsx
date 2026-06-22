import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import type { Profile } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

export default async function BusinessesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-heading font-black text-foreground mb-2">المشاريع المنزلية</h1>
        <p className="text-muted-foreground mb-8">تعرف على أصحاب المشاريع وتصفح منتجاتهم</p>

        {(!businesses || businesses.length === 0) ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-2xl mb-2">🏠</p>
            <p className="text-lg font-medium">لا توجد مشاريع بعد</p>
            <p className="text-sm mt-1">كن أول من يسجل مشروعه!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/businesses/${biz.id}`}
                className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative h-36 bg-secondary overflow-hidden">
                  {biz.cover_url ? (
                    <Image src={biz.cover_url} alt={biz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-5xl">🏠</div>
                  )}
                  <div className="absolute bottom-0 right-4 translate-y-1/2 w-14 h-14 rounded-xl bg-card border-2 border-card shadow-md overflow-hidden">
                    {biz.logo_url ? (
                      <Image src={biz.logo_url} alt={biz.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-2xl">🏡</div>
                    )}
                  </div>
                </div>
                <div className="pt-10 pb-4 px-4 flex flex-col gap-1.5">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{biz.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{CATEGORY_LABELS[biz.category] ?? biz.category}</Badge>
                    {biz.city && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {biz.city}
                      </span>
                    )}
                  </div>
                  {biz.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{biz.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
