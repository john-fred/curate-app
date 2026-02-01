'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import './AddItemForm.css'

interface AddItemFormProps {
  onItemAdded: () => void
}

export default function AddItemForm({ onItemAdded }: AddItemFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [tags, setTags] = useState('')
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !category.trim()) {
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
          category: category.trim(),
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
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., photography"
                required
              />
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
              {loading ? 'Saving...' : 'Save Item'}
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
