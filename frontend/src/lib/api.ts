const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Types
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: number
  title: string
  slug: string
  description: string
  price: number
  compare_at_price: number | null
  category_id: number
  image_url: string | null
  images: string | null
  stock_quantity: number
  featured: boolean
  active: boolean
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: number
  customer_email: string
  customer_name: string
  customer_phone: string | null
  total: number
  status: string
  shipping_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_products: number
  total_categories: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  low_stock_products: number
}

// API helper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

// Products
export async function getProducts(params?: { category?: string; featured?: boolean }): Promise<Product[]> {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append('category', params.category)
  if (params?.featured) searchParams.append('featured', 'true')
  return fetchAPI<Product[]>(`/products?${searchParams.toString()}`)
}

export async function getProduct(slug: string): Promise<Product> {
  return fetchAPI<Product>(`/products/${slug}`)
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  return fetchAPI<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(id: number): Promise<void> {
  return fetchAPI(`/products/${id}`, { method: 'DELETE' })
}

// Categories
export async function getCategories(): Promise<Category[]> {
  return fetchAPI<Category[]>('/categories')
}

export async function getCategory(slug: string): Promise<Category> {
  return fetchAPI<Category>(`/categories/${slug}`)
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return fetchAPI<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  return fetchAPI<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: number): Promise<void> {
  return fetchAPI(`/categories/${id}`, { method: 'DELETE' })
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return fetchAPI<Order[]>('/orders')
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  return fetchAPI<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Admin
export async function adminLogin(email: string, password: string): Promise<{ access_token: string }> {
  return fetchAPI('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/admin/stats')
}
