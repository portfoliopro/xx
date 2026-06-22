import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { MailCheck } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center flex flex-col items-center gap-5 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <MailCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-black text-foreground">تحقق من بريدك!</h1>
        <p className="text-muted-foreground leading-relaxed">
          أرسلنا لك رابط تفعيل على بريدك الإلكتروني. افتح البريد واضغط على الرابط لتفعيل حسابك.
        </p>
        <Link href="/auth/login" className={buttonVariants() + ' rounded-xl px-8'}>الذهاب لتسجيل الدخول</Link>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
