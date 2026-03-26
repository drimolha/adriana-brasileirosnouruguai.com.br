import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface AccessRecord {
  placeId: string
  timestamp: number
  expiresAt: number
}

interface AccessContextType {
  accesses: AccessRecord[]
  checkIn: (placeId: string) => void
  getPlaceStatus: (placeId: string) => 'active' | 'expired' | 'none'
}

const AccessContext = createContext<AccessContextType | undefined>(undefined)

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [accesses, setAccesses] = useState<AccessRecord[]>(() => {
    try {
      const saved = localStorage.getItem('@uruguai:accesses')
      if (!saved) {
        // Mock data to demonstrate dynamic coloring system
        return [
          { placeId: '1', timestamp: Date.now() - 1000, expiresAt: Date.now() + 3600000 }, // Active
          { placeId: '3', timestamp: Date.now() - 86400000, expiresAt: Date.now() - 80000000 }, // Expired
        ]
      }
      return JSON.parse(saved)
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('@uruguai:accesses', JSON.stringify(accesses))
  }, [accesses])

  const checkIn = (placeId: string) => {
    setAccesses((prev) => {
      const filtered = prev.filter((a) => a.placeId !== placeId)
      return [
        ...filtered,
        {
          placeId,
          timestamp: Date.now(),
          expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours duration
        },
      ]
    })
    toast.success('Check-in realizado com sucesso!', {
      description: 'Aproveite seus benefícios no estabelecimento.',
    })
  }

  const getPlaceStatus = (placeId: string) => {
    const record = accesses.find((a) => a.placeId === placeId)
    if (!record) return 'none'
    return Date.now() > record.expiresAt ? 'expired' : 'active'
  }

  return React.createElement(
    AccessContext.Provider,
    { value: { accesses, checkIn, getPlaceStatus } },
    children,
  )
}

export function useAccess() {
  const context = useContext(AccessContext)
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider')
  }
  return context
}
