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
  Clock
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

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  processing: 'default',
  shipped: 'secondary',
  delivered: 'success',
  cancelled: 'destructive',
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
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    
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
        <h1 className="text-3xl font-bold text-white">Orders</h1>
        <p className="text-dark-400 mt-1">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
        </p>
      </div>

      {/* Filters */}
      <Card glass className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
            <Input
              placeholder="Search by customer name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 pl-10 pr-8 rounded-xl border border-dark-700/50 bg-dark-800/50 backdrop-blur-xl text-dark-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer min-w-[180px]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-500 pointer-events-none" />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-dark-400 mt-4">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card glass className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-800/50 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-dark-500" />
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">No orders found</h3>
          <p className="text-dark-400">
            {searchQuery || statusFilter 
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers start placing them'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card glass className="p-6 hover:border-primary-500/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-6 w-6 text-primary-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-white font-semibold">
                            {order.customer_name}
                          </h3>
                          <Badge variant={statusColors[order.status] || 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-dark-400 text-sm">{order.customer_email}</p>
                        <div className="flex items-center gap-4 mt-2 text-dark-500 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(order.created_at)}
                          </span>
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Total & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-dark-400 text-sm">Total</p>
                        <p className="text-white font-bold text-xl">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
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
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card glass className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Order Details</h3>
                    <p className="text-dark-400 text-sm mt-1">
                      Order placed on {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <Badge variant={statusColors[selectedOrder.status] || 'secondary'}>
                    {selectedOrder.status}
                  </Badge>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Customer</h4>
                    <div className="space-y-2">
                      <p className="text-dark-300 text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4 text-dark-500" />
                        {selectedOrder.customer_email}
                      </p>
                      {selectedOrder.customer_phone && (
                        <p className="text-dark-300 text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4 text-dark-500" />
                          {selectedOrder.customer_phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {selectedOrder.shipping_address && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Shipping Address</h4>
                      <p className="text-dark-300 text-sm flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-dark-500 mt-0.5" />
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
                  <h4 className="text-white font-medium mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-dark-800/30"
                      >
                        <div>
                          <p className="text-white text-sm">
                            {item.product?.title || 'Unknown Product'}
                          </p>
                          <p className="text-dark-500 text-xs">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-white font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Status */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Update Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-700/30">
                  <span className="text-dark-400">Total</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
