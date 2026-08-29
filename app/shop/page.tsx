'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { productApi, categoryApi, uploadApi } from '@/lib/api'
import { ProductCard } from '@/components/shop/ProductCard'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Package,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
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
  categoryId?: string
  description?: string
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { products: number }
}

export default function ShopPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 12

  // CRUD Product modal states
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formStock, setFormStock] = useState('')
  const [formUnit, setFormUnit] = useState('kg')
  const [formCategory, setFormCategory] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sort, page])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll()
      setCategories(res.data.data)
      if (res.data.data.length > 0) {
        setFormCategory(res.data.data[0].id)
      }
    } catch {}
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await productApi.getAll({
        category: selectedCategory || undefined,
        search: search || undefined,
        page,
        limit: LIMIT,
        sort,
      })
      setProducts(res.data.data)
      setTotalPages(res.data.meta.totalPages)
      setTotal(res.data.meta.total)
    } catch {} finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleCreateClick = () => {
    setEditingProduct(null)
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormStock('')
    setFormUnit('kg')
    if (categories.length > 0) {
      setFormCategory(categories[0].id)
    }
    setFormImageUrl('')
    setImageSource('url')
    setIsUploadingImage(false)
    setIsCrudModalOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormDescription(product.description || '')
    setFormPrice(product.price.toString())
    setFormStock(product.stock.toString())
    setFormUnit(product.unit)
    setFormCategory(product.categoryId || (categories.find(c => c.name === product.category.name)?.id || ''))
    setFormImageUrl(product.imageUrl || '')
    setImageSource('url')
    setIsUploadingImage(false)
    setIsCrudModalOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog Toko Segar?')) return
    try {
      await productApi.delete(id)
      toast.success('Produk berhasil dihapus!')
      fetchProducts()
      fetchCategories()
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const res = await uploadApi.uploadImage(file)
      setFormImageUrl(res.data.url)
      toast.success('Gambar berhasil diunggah!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengunggah gambar')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCrudSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      stock: parseInt(formStock),
      unit: formUnit,
      categoryId: formCategory,
      imageUrl: formImageUrl || null,
    }

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, payload)
        toast.success('Produk berhasil diperbarui!')
      } else {
        await productApi.create(payload)
        toast.success('Produk baru berhasil ditambahkan!')
      }
      setIsCrudModalOpen(false)
      fetchProducts()
      fetchCategories()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan produk')
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gradient-to-b from-agro-soft/30 to-background">
      <SiteHeader variant="overlay-auto" />

      <div className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">

        {/* ── Hero Banner ── */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-border shadow-lg" style={{ minHeight: '340px' }}>
          <Image
            src="/agriculture.png"
            alt="Toko Segar Gromar"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: 'center 18%' }}
            sizes="100vw"
          />
          {/* Gradient overlay — matching B2B dashboard style */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a5c2a]/90 via-[#1a5c2a]/55 to-transparent" />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />

          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-white/10 blur-2xl animate-float-slow" />
          <div className="pointer-events-none absolute right-1/3 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-float" />

          <div className="relative flex flex-col items-start justify-center h-full px-8 sm:px-12 py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur mb-4">
              <Package className="h-4 w-4" />
              Produk Segar
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-md text-balance">
              Toko{' '}
              <span className="bg-gradient-to-r from-white via-grain to-white bg-clip-text text-transparent">
                Gromar
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-white/90 font-medium drop-shadow-sm">
              Produk pertanian &amp; hasil laut segar, langsung dari produsen lokal
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-3 w-full max-w-xl">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk segar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-full bg-white pl-12 pr-4 text-sm text-foreground outline-none shadow-md placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                className="h-12 rounded-full bg-grain px-6 text-sm font-bold text-foreground shadow-md transition-colors hover:bg-grain/90 whitespace-nowrap"
              >
                Cari
              </button>
            </form>
          </div>
        </section>

        {/* ── Main Layout ── */}
        <div className="flex gap-7 pb-16">

          {/* Sidebar Filter */}
          <aside className="hidden w-60 shrink-0 md:block">
            <div className="sticky top-20 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border font-bold text-foreground">
                <SlidersHorizontal size={17} className="text-agro" />
                <span>Filter Produk</span>
              </div>

              {/* Categories */}
              <div className="mb-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Kategori
                </p>
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1) }}
                  className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors text-left ${
                    !selectedCategory
                      ? 'bg-agro-soft font-semibold text-agro'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${!selectedCategory ? 'bg-agro/15 text-agro' : 'bg-secondary text-muted-foreground'}`}>
                    {total}
                  </span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                    className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors text-left ${
                      selectedCategory === cat.slug
                        ? 'bg-agro-soft font-semibold text-agro'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${selectedCategory === cat.slug ? 'bg-agro/15 text-agro' : 'bg-secondary text-muted-foreground'}`}>
                      {cat._count.products}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Urutkan
                </p>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1) }}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none cursor-pointer focus:border-agro"
                  style={{ appearance: 'auto' }}
                >
                  <option value="createdAt">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Main Area */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan <strong className="text-foreground">{products.length}</strong> dari{' '}
                <strong className="text-foreground">{total}</strong> produk
              </p>
              {isAdmin && (
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center gap-2 rounded-full bg-agro px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-agro/90 cursor-pointer border border-agro/20"
                >
                  <Plus size={14} /> Tambah Produk
                </button>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-3xl bg-gradient-to-br from-secondary to-border animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
                <Search size={40} className="text-muted-foreground mb-4" />
                <p className="text-base font-semibold text-foreground">Produk tidak ditemukan</p>
                <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci lain atau reset filter</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory(''); setPage(1) }}
                  className="mt-5 rounded-full bg-agro px-5 py-2 text-sm font-bold text-white hover:bg-agro/90 transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-agro-soft hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm text-muted-foreground">
                  Hal <strong className="text-foreground">{page}</strong> dari {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-agro-soft hover:border-agro hover:text-agro disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Admin Product Add/Edit Modal ── */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCrudModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-extrabold text-foreground">
              {editingProduct ? 'Edit Produk Toko' : 'Tambah Produk Baru'}
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Kelola stok dan harga komoditas segar di katalog Toko Segar Gromar.
            </p>

            <form onSubmit={handleCrudSubmit} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Nama Produk</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                  placeholder="Contoh: Pisang Cavendish"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Satuan Jual</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                    placeholder="Contoh: kg, sisir, ikat"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                    placeholder="Contoh: 15000"
                    required
                    min="1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Stok Tersedia</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                    placeholder="Contoh: 100"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Image Source Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-muted-foreground">Sumber Gambar</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={imageSource === 'url'}
                      onChange={() => setImageSource('url')}
                      className="cursor-pointer"
                    />
                    URL Gambar Publik
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="imageSource"
                      checked={imageSource === 'file'}
                      onChange={() => setImageSource('file')}
                      className="cursor-pointer"
                    />
                    Unggah dari File
                  </label>
                </div>
              </div>

              {imageSource === 'url' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">URL Gambar (Opsional)</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Pilih File Gambar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-border file:text-xs file:font-bold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                  />
                  {isUploadingImage && (
                    <span className="text-xs text-agro animate-pulse mt-1 font-semibold">Mengunggah file gambar...</span>
                  )}
                  {formImageUrl && !isUploadingImage && (
                    <div className="mt-1 text-xs text-green-600 flex flex-col gap-0.5">
                      <span className="font-semibold">Berhasil diunggah:</span>
                      <a href={formImageUrl} target="_blank" rel="noopener noreferrer" className="underline break-all">
                        {formImageUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">Deskripsi Produk</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-agro outline-none min-h-[80px]"
                  placeholder="Penjelasan produk segar..."
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCrudModalOpen(false)}
                  className="w-1/2 rounded-full font-bold h-11 border border-border hover:bg-secondary text-sm cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="w-1/2 rounded-full font-bold h-11 text-white bg-agro hover:bg-agro/90 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
