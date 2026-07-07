'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { productApi } from '@/lib/api'
import { useCartStore } from '@/lib/store/cart'
import { useAuthStore } from '@/lib/store/auth'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { ShoppingCart, ArrowLeft, Star, Package, CheckCircle, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  imageUrl: string | null
  unit: string
  category: { name: string; slug: string }
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem, isLoading: cartLoading } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (slug) fetchProduct()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const fetchProduct = async () => {
    try {
      const res = await productApi.getBySlug(slug as string)
      setProduct(res.data.data)
    } catch {
      router.push('/shop')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return }
    if (!product) return
    try {
      await addItem(product.id, quantity)
      toast.success(`${product.name} (${quantity} ${product.unit}) ditambahkan!`)
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  if (isLoading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="product-detail-page">
      <SiteHeader />
      <CartDrawer />

      <div className="product-detail-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/shop" className="breadcrumb-link">
            <ArrowLeft size={16} /> Kembali ke Toko
          </Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="breadcrumb-link">
            {product.category.name}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-detail-image-wrapper">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="product-detail-image"
                priority
              />
            ) : (
              <div className="product-detail-placeholder">
                <Package size={48} className="text-muted-foreground" />
              </div>
            )}
            <div className="product-detail-category-badge">{product.category.name}</div>
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <h1 className="product-detail-name">{product.name}</h1>

            {/* Rating */}
            <div className="product-detail-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className={i < 4 ? 'star-filled' : 'star-empty'} />
              ))}
              <span className="rating-text">4.0 (24 ulasan)</span>
            </div>

            {/* Price */}
            <div className="product-detail-price-block">
              <span className="product-detail-price">{formatPrice(product.price)}</span>
              <span className="product-detail-unit">/{product.unit}</span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="product-detail-desc">
                <h3>Deskripsi Produk</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Stock */}
            <div className={`product-detail-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {product.stock > 0 ? (
                <>
                  <CheckCircle size={16} />
                  <span>Stok tersedia: {product.stock} {product.unit}</span>
                </>
              ) : (
                <>
                  <Package size={16} />
                  <span>Stok habis</span>
                </>
              )}
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="product-detail-qty">
                <span className="qty-label">Jumlah:</span>
                <div className="qty-controls">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="qty-control-btn"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-display">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="qty-control-btn"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="qty-total">= {formatPrice(product.price * quantity)}</span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="product-detail-actions">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock === 0}
                className="product-detail-add-btn"
              >
                <ShoppingCart size={20} />
                {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
