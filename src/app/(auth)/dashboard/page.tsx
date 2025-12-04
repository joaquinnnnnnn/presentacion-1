'use client'
import { useEffect, useState } from 'react'
import { fetchMe, logout } from '@/lib/client-auth'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [me, setMe] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchMe().then(u => { if (!u) router.replace('/login'); else setMe(u) })
  }, [router])

  if (!me) return <main className="p-6">Cargando...</main>

  return (
    <main className="max-w-xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl">Hola, {me.email}</h1>
      <button className="rounded px-3 py-2 bg-black text-white w-max" onClick={async()=>{ await logout(); router.replace('/login') }}>Cerrar sesión</button>
      <pre className="text-xs bg-gray-100 p-3 rounded">{JSON.stringify(me, null, 2)}</pre>
    </main>
  )
}
