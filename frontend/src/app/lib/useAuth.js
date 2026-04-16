'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth({ requireAdmin = false } = {}) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
          credentials: 'include',
        })

        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()

        if (requireAdmin && data.user.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  return { user, loading }
}