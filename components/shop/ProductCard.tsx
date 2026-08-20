'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package } from 'lucide-react'
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
  const isSoldOut = product.stock === 0

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        {/* Image */}
        <div className="relative h-44 w-full overflow-hidden bg-secondary">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="text-muted-foreground" size={36} />
            </div>
          )}

          {/* Category badge */}
          <span className="absolute left-3 top-3 rounded-full bg-agro/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {product.category.name}
          </span>

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
                Habis
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Stock status */}
          <p className={`mt-1 text-[11px] font-semibold ${isSoldOut ? 'text-red-500' : 'text-agro'}`}>
            {isSoldOut ? 'Stok habis' : `Stok: ${product.stock} ${product.unit}`}
          </p>

          {/* Price row */}
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-base font-extrabold text-foreground">
                {formatPrice(product.price)}
              </p>
              <p className="text-[11px] text-muted-foreground">per {product.unit}</p>
            </div>

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading || isSoldOut}
                title="Tambah ke keranjang"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-agro text-white shadow-sm transition-all hover:bg-agro/90 hover:shadow-md disabled:cursor-not-allowed disabled:bg-border disabled:text-muted-foreground"
              >
                <ShoppingCart size={15} />
              </button>
            )}
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div
              className="mt-3 flex gap-2 border-t border-border/60 pt-3"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <button
                onClick={() => onEdit?.(product)}
                className="flex-1 rounded-full border border-border py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete?.(product.id)}
                className="flex-1 rounded-full border border-red-200 bg-red-50 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
