'use client'

import { useState, useEffect } from 'react'
import { productApi, categoryApi, uploadApi } from '@/lib/api'
import { ProductCard } from '@/components/shop/ProductCard'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus, X, Package } from 'lucide-react'
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
    <div className="shop-page">
      <SiteHeader />

      <div className="shop-container" style={{ paddingTop: '2rem' }}>
        {/* Hero Banner */}
        <section className="shop-hero">
          <div className="shop-hero-overlay" />
          <div className="shop-hero-content">
            <span className="shop-hero-badge">Produk Segar</span>
            <h1 className="shop-hero-title">Toko Gromar</h1>
            <p className="shop-hero-subtitle">
              Produk pertanian & hasil laut segar, langsung dari produsen lokal
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="shop-search">
              <div className="shop-search-input-wrapper">
                <Search size={20} className="shop-search-icon" />
                <input
                  type="text"
                  placeholder="Cari produk segar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="shop-search-input"
                />
              </div>
              <button type="submit" className="shop-search-btn">
                Cari
              </button>
            </form>
          </div>
        </section>

        <div className="shop-layout">
          {/* Sidebar */}
          <aside className="shop-sidebar">
            <div className="shop-filter-card">
              <div className="shop-filter-header">
                <SlidersHorizontal size={18} />
                <span>Filter Produk</span>
              </div>

              {/* Categories */}
              <div className="shop-filter-section">
                <h3 className="shop-filter-label">Kategori</h3>
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1) }}
                  className={`shop-cat-btn ${!selectedCategory ? 'active' : ''}`}
                >
                  Semua Kategori
                  <span className="shop-cat-count">{total}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1) }}
                    className={`shop-cat-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  >
                    {cat.name}
                    <span className="shop-cat-count">{cat._count.products}</span>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="shop-filter-section">
                <h3 className="shop-filter-label">Urutkan</h3>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1) }}
                  className="shop-sort-select"
                >
                  <option value="createdAt">Terbaru</option>
                  <option value="price_asc">Harga Terendah</option>
                  <option value="price_desc">Harga Tertinggi</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="shop-main flex flex-col">
            <div className="shop-results-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="shop-results-info">
                Menampilkan <strong>{products.length}</strong> dari <strong>{total}</strong> produk
              </p>
              {isAdmin && (
                <button
                  onClick={handleCreateClick}
                  className="inline-flex items-center gap-1 bg-agro hover:bg-agro/95 text-white font-extrabold text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer shadow-sm border border-agro/25"
                >
                  <Plus size={14} /> Tambah Produk
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="shop-grid mt-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="product-card-skeleton" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="shop-empty mt-4">
                <Search size={48} className="text-muted-foreground mx-auto mb-4" />
                <p>Produk tidak ditemukan</p>
                <button onClick={() => { setSearch(''); setSelectedCategory(''); setPage(1) }} className="shop-empty-reset">
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="shop-grid mt-4">
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
              <div className="shop-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={18} /> Prev
                </button>
                <span className="pagination-info">Hal {page} dari {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Super Admin Product Add/Edit Modal ── */}
      {isCrudModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCrudModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
              <span>{editingProduct ? 'Edit Produk Toko' : 'Tambah Produk Baru'}</span>
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
                  className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
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
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Satuan Jual (Unit)</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
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
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
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
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Contoh: 100"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Image Input Source Selector */}
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
                    className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
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
                  className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
                  placeholder="Penjelasan produk segar..."
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCrudModalOpen(false)}
                  className="w-1/2 rounded-full font-bold h-11 border border-border hover:bg-secondary text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="w-1/2 rounded-full font-bold h-11 text-white bg-agro hover:bg-agro/90 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
