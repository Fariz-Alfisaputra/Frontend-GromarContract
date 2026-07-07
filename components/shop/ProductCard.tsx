'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star, Package } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  unit: string
  stock: number
  category: { name: string; slug: string }
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
}) {
  const { addItem, isLoading } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }
    try {
      await addItem(product.id, 1)
      toast.success(`${product.name} ditambahkan ke keranjang!`)
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  const isAdmin = user?.role === 'ADMIN'

  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div className="product-card">
        <div className="product-card-image-wrapper">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="product-card-image"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="product-card-placeholder">
              <Package className="text-muted-foreground" size={24} />
            </div>
          )}
          <div className="product-card-badge">
            {product.category.name}
          </div>
          {product.stock === 0 && (
            <div className="product-card-sold-out">Habis</div>
          )}
        </div>

        <div className="product-card-body">
          <h3 className="product-card-name">{product.name}</h3>

          <div className="product-card-rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < 4 ? 'star-filled' : 'star-empty'} />
            ))}
            <span className="rating-count">(4.0)</span>
          </div>

          <div className="product-card-footer">
            <div>
              <span className="product-price">{formatPrice(product.price)}</span>
              <span className="product-unit"> /{product.unit}</span>
            </div>
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading || product.stock === 0}
                className="add-to-cart-btn"
                title="Tambah ke keranjang"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="stock-available">Stok: {product.stock} {product.unit}</span>
            ) : (
              <span className="stock-out">Stok habis</span>
            )}
          </div>

          {isAdmin && (
            <div
              className="flex gap-2 mt-4 pt-3 border-t border-border/60 justify-end"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <button
                onClick={() => onEdit?.(product)}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-xs px-3 py-1.5 rounded-lg font-bold border border-yellow-200 transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(product.id)}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-lg font-bold border border-red-200 transition-colors cursor-pointer"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
