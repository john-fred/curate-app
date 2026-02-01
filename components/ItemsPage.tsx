'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AddItemForm from '@/components/AddItemForm'
import ItemsList from '@/components/ItemsList'
import './ItemsPage.css'

export default function ItemsPage({ user }: { user: any }) {
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [daysOldFilter, setDaysOldFilter] = useState(0)

  // Fetch items
  const fetchItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('date_saved', { ascending: false })

      if (error) throw error
      setItems(data || [])

      // Extract unique categories
const cats = Array.from(new Set((data || []).map((item) => item.category))).sort()
      setCategories(cats)
    } catch (err) {
      console.error('Error fetching items:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  // Filter items
  useEffect(() => {
    let filtered = items

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === selectedStatus)
    }

    // Days old filter
    if (daysOldFilter > 0) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOldFilter)
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date_saved)
        return itemDate < cutoffDate
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((item) => {
        const title = item.title.toLowerCase()
        const notes = (item.notes || '').toLowerCase()
        const tags = (item.tags || []).join(' ').toLowerCase()
        return title.includes(query) || notes.includes(query) || tags.includes(query)
      })
    }

    setFilteredItems(filtered)
  }, [items, selectedCategory, selectedStatus, daysOldFilter, searchQuery])

  const handleItemAdded = () => {
    fetchItems()
  }

  const handleItemDeleted = () => {
    fetchItems()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="items-page">
      <header className="header">
        <div className="header-content">
          <h1>Curate</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          <AddItemForm onItemAdded={handleItemAdded} />

          <div className="filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search title, notes, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Not viewed for</label>
                <select
                  value={daysOldFilter}
                  onChange={(e) => setDaysOldFilter(Number(e.target.value))}
                >
                  <option value={0}>All items</option>
                  <option value={7}>7+ days</option>
                  <option value={30}>30+ days</option>
                  <option value={90}>90+ days</option>
                  <option value={365}>1+ year</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <p>No items found. Add one to get started!</p>
            </div>
          ) : (
            <ItemsList items={filteredItems} onItemDeleted={handleItemDeleted} />
          )}
        </div>
      </div>
    </div>
  )
}
