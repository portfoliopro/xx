import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/navbar'
import HeroSection from '@/components/home/hero-section'
import CategoriesSection from '@/components/home/categories-section'
import FeaturedProducts from '@/components/home/featured-products'
import HowItWorks from '@/components/home/how-it-works'
import FeaturedBusinesses from '@/components/home/featured-businesses'
import Footer from '@/components/footer'
import type { Profile } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, business:businesses(*)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen">
      <Navbar profile={profile} />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts products={products ?? []} />
      <HowItWorks />
      <FeaturedBusinesses businesses={businesses ?? []} />
      <Footer />
    </main>
  )
}
