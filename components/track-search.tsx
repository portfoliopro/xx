'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function TrackSearch({ defaultCode }: { defaultCode?: string }) {
  const router = useRouter()
  const [code, setCode] = useState(defaultCode ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim()) {
      router.push(`/track?code=${code.trim().toUpperCase()}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        placeholder="أدخل رمز التتبع (مثال: A1B2C3D4)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="flex-1 text-center font-mono text-lg h-12 tracking-widest"
        maxLength={8}
      />
      <Button type="submit" size="lg" className="px-6 rounded-xl font-bold gap-2">
        <Search className="w-5 h-5" />
        تتبع
      </Button>
    </form>
  )
}
