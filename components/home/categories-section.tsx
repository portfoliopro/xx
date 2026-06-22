import Link from 'next/link'

const categories = [
  { key: 'food', label: 'طعام', icon: '🍱', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100' },
  { key: 'sweets', label: 'حلويات', icon: '🍯', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100' },
  { key: 'bakery', label: 'مخبوزات', icon: '🥐', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100' },
  { key: 'drinks', label: 'مشروبات', icon: '🧃', color: 'bg-lime-50 hover:bg-lime-100 text-lime-700 border-lime-100' },
  { key: 'health', label: 'صحي وطبيعي', icon: '🌿', color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-100' },
  { key: 'handmade', label: 'مشغولات يدوية', icon: '🧶', color: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-100' },
]

export default function CategoriesSection() {
  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">تصفح حسب الفئة</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/products?category=${cat.key}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${cat.color}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
