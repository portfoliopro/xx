import { Search, ShoppingBag, MapPin, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'تصفح المنتجات',
    desc: 'اكتشف منتجات طازجة من مشاريع منزلية في منطقتك.',
    step: '١',
  },
  {
    icon: ShoppingBag,
    title: 'اطلب بسهولة',
    desc: 'أضف ما يعجبك إلى طلبك وأدخل عنوان التوصيل.',
    step: '٢',
  },
  {
    icon: MapPin,
    title: 'تتبع طلبك',
    desc: 'راقب مسار طلبك لحظة بلحظة حتى يصل بابك.',
    step: '٣',
  },
  {
    icon: CheckCircle,
    title: 'استلم وانبسط',
    desc: 'استلم طلبك طازجاً وقيّم تجربتك مع المشروع.',
    step: '٤',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-black text-foreground">كيف يعمل وصلني؟</h2>
          <p className="text-muted-foreground mt-2 text-base">أربع خطوات بسيطة للحصول على طلبك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute left-0 top-1/3 w-full h-px bg-border -z-10 translate-x-1/2" />
              )}

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                  {step.step}
                </span>
              </div>

              <h3 className="font-bold text-base text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
