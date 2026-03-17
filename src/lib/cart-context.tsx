'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  title: string
  price: number
  image_url: string | null
  quantity: number
  stock_quantity: number
  // Variant support
  variant_id?: string
  variant_title?: string
  variant_price?: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_KEY = 'ozsheeptight_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveCart(items)
  }, [items, loaded])

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(prev => {
      // For variant items, use variant_id as unique key
      const itemKey = item.variant_id || item.id
      const existing = prev.find(i => {
        const existingKey = i.variant_id || i.id
        return existingKey === itemKey
      })
      
      if (existing) {
        const newQty = Math.min(existing.quantity + (item.quantity || 1), item.stock_quantity)
        return prev.map(i => {
          const iKey = i.variant_id || i.id
          return iKey === itemKey ? { ...i, quantity: newQty } : i
        })
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => {
      const itemKey = i.variant_id || i.id
      return itemKey !== id
    }))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setItems(prev => prev.map(i => {
      const itemKey = i.variant_id || i.id
      if (itemKey === id) {
        return { ...i, quantity: Math.min(quantity, i.stock_quantity) }
      }
      return i
    }))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, item) => {
    const price = item.variant_price !== undefined ? item.variant_price : item.price
    return sum + price * item.quantity
  }, 0)
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
