export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          category_id: string | null
          image_url: string | null
          images: string[] | null
          stock_quantity: number
          featured: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          category_id?: string | null
          image_url?: string | null
          images?: string[] | null
          stock_quantity?: number
          featured?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          category_id?: string | null
          image_url?: string | null
          images?: string[] | null
          stock_quantity?: number
          featured?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          total: number
          status: string
          shipping_address: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          total: number
          status?: string
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          total?: number
          status?: string
          shipping_address?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      variant_options: {
        Row: {
          id: string
          product_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'variant_options_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      variant_values: {
        Row: {
          id: string
          option_id: string
          value: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          option_id: string
          value: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          option_id?: string
          value?: string
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'variant_values_option_id_fkey'
            columns: ['option_id']
            isOneToOne: false
            referencedRelation: 'variant_options'
            referencedColumns: ['id']
          }
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          title: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          image_url: string | null
          stock_quantity: number
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          title?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          image_url?: string | null
          stock_quantity?: number
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          title?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          image_url?: string | null
          stock_quantity?: number
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      variant_value_combinations: {
        Row: {
          variant_id: string
          value_id: string
        }
        Insert: {
          variant_id: string
          value_id: string
        }
        Update: {
          variant_id?: string
          value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'variant_value_combinations_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'variant_value_combinations_value_id_fkey'
            columns: ['value_id']
            isOneToOne: false
            referencedRelation: 'variant_values'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']

// Variant types
export interface VariantOption {
  id: string
  product_id: string
  name: string
  position: number
  created_at: string
  updated_at: string
  values?: VariantValue[]
}

export interface VariantValue {
  id: string
  option_id: string
  value: string
  position: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  title: string | null
  sku: string | null
  price: number
  compare_at_price: number | null
  image_url: string | null
  stock_quantity: number
  position: number
  created_at: string
  updated_at: string
  value_combinations?: VariantValueCombination[]
}

export interface VariantValueCombination {
  variant_id: string
  value_id: string
  value?: VariantValue
}

// Extended product type with variants
export interface ProductWithVariants extends Product {
  variant_options?: VariantOption[]
  variants?: ProductVariant[]
}
