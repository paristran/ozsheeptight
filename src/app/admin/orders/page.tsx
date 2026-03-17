'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Eye,
  ShoppingCart,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Clock,
  Package,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderItem } from '@/lib/types/database'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface OrderWithItems extends Order {
  items: (OrderItem & { product?: { title: string; image_url: string | null } })[]
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info' | 'purple' | 'pink', emoji: string }> = {
  pending: { variant: 'warning', emoji: '⏳' },
  processing: { variant: 'info', emoji: '⚙️' },
  shipped: { variant: 'purple', emoji: '📦' },
  delivered: { variant: 'success', emoji: '✅' },
  cancelled: { variant: 'destructive', emoji: '❌' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(title, image_url))')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data as OrderWithItems[])
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, status: string) {
    await fetch('/api/admin/crud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'orders', action: 'update', id: orderId, data: { status } }),
    })
    
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status } : o
    ))
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          🛒 Orders
        </h1>
        <p className="text-slate-500 mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 border-2 border-light-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-12 pl-12 pr-10 rounded-2xl border-2 border-light-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="processing">⚙️ Processing</option>
              <option value="shipped">📦 Shipped</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="spinner-fun mx-auto" />
          <p className="text-slate-500 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-12 text-center border-2 border-light-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="text-slate-800 text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-slate-500">
            {searchQuery || statusFilter 
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start placing them'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const config = statusConfig[order.status] || statusConfig.pending
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="p-6 border-2 border-light-200 hover:border-primary-200 transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center shrink-0">
                          <span className="text-2xl">{config.emoji}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-slate-800 font-bold">
                              {order.customer_name}
                            </h3>
                            <Badge variant={config.variant}>
                              {config.emoji} {order.status}
                            </Badge>
                          </div>
                          <p className="text-slate-500 text-sm">{order.customer_email}</p>
                          <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(order.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3.5 w-3.5" />
                              {order.items?.length || 0} items
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Total & Actions */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-slate-500 text-sm">Total</p>
                          <p className="text-slate-800 font-bold text-xl">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedOrder(order)}
                          className="hover:border-primary-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-2 border-light-200">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b-2 border-light-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      📋 Order Details
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Order placed on {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-light-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="mb-6">
                    <Badge 
                      variant={statusConfig[selectedOrder.status]?.variant || 'secondary'}
                      className="text-base px-4 py-2"
                    >
                      {statusConfig[selectedOrder.status]?.emoji} {selectedOrder.status}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3 p-4 rounded-2xl bg-light-50">
                      <h4 className="text-slate-800 font-bold flex items-center gap-2">
                        👤 Customer
                      </h4>
                      <div className="space-y-2">
                        <p className="text-slate-600 text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {selectedOrder.customer_email}
                        </p>
                        {selectedOrder.customer_phone && (
                          <p className="text-slate-600 text-sm flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {selectedOrder.customer_phone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {selectedOrder.shipping_address && (
                      <div className="space-y-3 p-4 rounded-2xl bg-light-50">
                        <h4 className="text-slate-800 font-bold flex items-center gap-2">
                          📍 Shipping Address
                        </h4>
                        <p className="text-slate-600 text-sm flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                          <span>
                            {(selectedOrder.shipping_address as any).address}<br />
                            {(selectedOrder.shipping_address as any).city}, {(selectedOrder.shipping_address as any).state} {(selectedOrder.shipping_address as any).postcode}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                      📦 Items
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-2xl bg-light-50 border-2 border-light-100"
                        >
                          <div>
                            <p className="text-slate-800 font-medium">
                              {item.product?.title || 'Unknown Product'}
                            </p>
                            <p className="text-slate-400 text-sm">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="text-slate-800 font-bold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="mb-6">
                    <h4 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
                      ⚙️ Update Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <Button
                          key={status}
                          variant={selectedOrder.status === status ? 'default' : 'secondary'}
                          size="sm"
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          className={selectedOrder.status === status ? '' : 'hover:border-primary-200'}
                        >
                          {statusConfig[status]?.emoji} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-light-200">
                    <span className="text-slate-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-slate-800">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
