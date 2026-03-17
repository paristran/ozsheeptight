'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  FolderTree,
  Image as ImageIcon,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types/database'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<(Category & { product_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient() as any
    
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('name')

    if (data) {
      const categoriesWithCount = data.map((cat: any) => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0,
      }))
      setCategories(categoriesWithCount)
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    
    if (name === 'name' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }))
    }
  }

  const openAddModal = () => {
    setFormData({ name: '', slug: '', description: '', image_url: '' })
    setShowModal('add')
  }

  const openEditModal = (category: Category) => {
    setEditCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
    })
    setShowModal('edit')
  }

  const handleSave = async () => {
    if (!formData.name) return
    setSaving(true)

    const endpoint = '/api/admin/crud'
    const payload: any = {
      table: 'categories',
      data: {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description || null,
        image_url: formData.image_url || null,
      },
    }

    if (showModal === 'add') {
      payload['action'] = 'insert'
    } else if (showModal === 'edit' && editCategory) {
      payload['action'] = 'update'
      payload['id'] = editCategory.id
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()

    if (result.error) {
      alert('Error: ' + result.error)
      setSaving(false)
      return
    }

    setShowModal(null)
    setSaving(false)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/admin/crud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'categories', action: 'delete', id }),
    })
    const result = await res.json()

    if (result.error) {
      alert('Error deleting category: ' + result.error)
      return
    }

    setCategories(categories.filter(c => c.id !== id))
    setShowDeleteModal(null)
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Card color variations
  const cardColors = [
    { bg: 'from-primary-50 to-white', border: 'border-primary-100 hover:border-primary-200' },
    { bg: 'from-purple-50 to-white', border: 'border-purple-100 hover:border-purple-200' },
    { bg: 'from-accent-50 to-white', border: 'border-accent-100 hover:border-accent-200' },
    { bg: 'from-secondary-50 to-white', border: 'border-secondary-100 hover:border-secondary-200' },
    { bg: 'from-pink-50 to-white', border: 'border-pink-100 hover:border-pink-200' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            📂 Categories
          </h1>
          <p className="text-slate-500 mt-1">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 border-2 border-light-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="spinner-fun mx-auto" />
          <p className="text-slate-500 mt-4">Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="p-12 text-center border-2 border-light-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <FolderTree className="h-10 w-10 text-purple-400" />
          </div>
          <h3 className="text-slate-800 text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-slate-500 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first category'}
          </p>
          {!searchQuery && (
            <Button onClick={openAddModal}>
              <Plus className="mr-2 h-5 w-5" />
              Add Category
            </Button>
          )}
        </Card>
      ) : (
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCategories.map((category, index) => {
              const colorScheme = cardColors[index % cardColors.length]
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`group overflow-hidden border-2 ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg} transition-all duration-300`}>
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-light-100 to-light-50">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl">📂</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      
                      {/* Actions Overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm"
                          onClick={() => openEditModal(category)}
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9 rounded-xl"
                          onClick={() => setShowDeleteModal(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-slate-800 font-bold text-lg">{category.name}</h3>
                        <Badge variant="secondary">{category.product_count} products</Badge>
                      </div>
                      {category.description && (
                        <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                          {category.description}
                        </p>
                      )}
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        📅 Created {formatDate(category.created_at)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg"
            >
              <Card className="p-6 border-2 border-light-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    {showModal === 'add' ? '📂 Add Category' : '✏️ Edit Category'}
                  </h3>
                  <button
                    onClick={() => setShowModal(null)}
                    className="text-slate-400 hover:text-slate-600 p-2 hover:bg-light-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-slate-600 text-sm font-medium mb-2 block">Name *</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm font-medium mb-2 block">Slug</label>
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="category-slug"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Category description..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 text-sm font-medium mb-2 block">Image URL</label>
                    <Input
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={saving || !formData.name}
                  >
                    {saving ? 'Saving...' : showModal === 'add' ? 'Create' : 'Save Changes'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <Card className="p-6 max-w-md w-full border-2 border-light-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-100 flex items-center justify-center">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Category</h3>
                  <p className="text-slate-500">
                    Are you sure? Products in this category will become uncategorized.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDeleteModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(showDeleteModal)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
