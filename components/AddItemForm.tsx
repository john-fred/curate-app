'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import './AddItemForm.css'

interface AddItemFormProps {
  onItemAdded: () => void
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [newCategoryValue, setNewCategoryValue] = useState('')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [subcategory, setSubcategory] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch distinct categories whenever the form opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('category')
        .order('category')

      if (error) throw error

      // Deduplicate and sort
      const unique = Array.from(
        new Set((data || []).map((row: { category: string }) => row.category.trim()))
      ).sort((a, b) => a.localeCompare(b))

      setExistingCategories(unique)
    } catch (err) {
      console.error('Could not load categories:', err)
    }
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__new__') {
      setIsNewCategory(true)
      setCategory('')
    } else {
      setIsNewCategory(false)
      setCategory(val)
    }
  }

  const effectiveCategory = isNewCategory ? newCategoryValue : category

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !effectiveCategory.trim()) {
      setError('Title and category are required')
      return
    }

    setLoading(true)

    try {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error: insertError } = await supabase.from('items').insert([
        {
          title: title.trim(),
          category: effectiveCategory.trim(),
          subcategory: subcategory.trim() || null,
          tags: tagArray,
          notes: notes.trim() || null,
          url: url.trim() || null,
          status: 'new',
          date_saved: new Date().toISOString(),
          date_last_reviewed: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      // Reset form
      setTitle('')
      setCategory('')
      setIsNewCategory(false)
      setNewCategoryValue('')
      setSubcategory('')
      setTags('')
      setNotes('')
      setUrl('')
      setIsOpen(false)

      onItemAdded()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-item-form">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="add-button">
          + Add Item
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-header">
            <h2>Add New Item</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="close-btn"
            >
              ✕
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review new Canon lens"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>

              {/* Dropdown of existing categories */}
              <select
                id="category"
                value={isNewCategory ? '__new__' : category}
                onChange={handleCategoryChange}
                required={!isNewCategory}
                style={{ marginBottom: isNewCategory ? '8px' : '0' }}
              >
                <option value="" disabled>
                  — select a category —
                </option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__new__">＋ New category…</option>
              </select>

              {/* Text input revealed only when "New category" is chosen */}
              {isNewCategory && (
                <input
                  id="new-category"
                  type="text"
                  value={newCategoryValue}
                  onChange={(e) => setNewCategoryValue(e.target.value)}
                  placeholder="Type new category name"
                  required
                  autoFocus
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subcategory">Subcategory</label>
              <input
                id="subcategory"
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g., lenses (optional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="url">URL (optional)</label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated, optional)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., urgent, review, budget"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (markdown supported, optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes here... **bold**, *italic*, [link](url)"
              rows={4}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving…' : 'Save Item'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
