export type Role = 'customer' | 'seller' | 'driver' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
  avatar_url: string | null
  created_at: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  city: string | null
  address: string | null
  phone: string | null
  category: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_available: boolean
  slug: string | null
  payment_link: string | null
  created_at: string
  business?: Business
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customer_id: string
  business_id: string
  driver_id: string | null
  status: OrderStatus
  total_amount: number
  delivery_address: string
  delivery_lat: number | null
  delivery_lng: number | null
  notes: string | null
  tracking_code: string
  created_at: string
  updated_at: string
  business?: Business
  customer?: Profile
  driver?: Profile
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  product?: Product
}

export interface DriverLocation {
  id: string
  driver_id: string
  order_id: string | null
  lat: number
  lng: number
  updated_at: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'في الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'قيد التحضير',
  ready: 'جاهز للاستلام',
  picked_up: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
}

export const CATEGORY_LABELS: Record<string, string> = {
  general: 'عام',
  food: 'طعام',
  sweets: 'حلويات',
  bakery: 'مخبوزات',
  drinks: 'مشروبات',
  handmade: 'مشغولات يدوية',
  health: 'صحي وطبيعي',
}
