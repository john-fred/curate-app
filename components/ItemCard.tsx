'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabaseClient'
import './ItemCard.css'

interface ItemCardProps {
  item: any
  isExpanded: boolean
  onToggleExpand: () => void
  onMarkReviewed: () => void
  onArchive: () => void
  onDelete: () => void
  onItemUpdated: () => void
}

export default function ItemCard({
  item,
  isExpanded,
  onToggleExpand,
  onMarkReviewed,
  onArchive,
  onDelete,
  onItemUpdated,
}: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editCategory, setEditCategory] = useState(item.category)
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [newCategoryValue, setNewCategoryValue] = useState('')
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [editSubcategory, setEditSubcategory] = useState(item.subcategory || '')
  const [editTags, setEditTags] = useState((item.tags || []).join(', '))
  const [editNotes, setEditNotes] = useState(item.notes || '')
  const [editUrl, setEditUrl] = useState(item.url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  // Fetch distinct categories when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetchCategories()
    }
  }, [isEditing])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('category')
        .order('category')

      if (error) throw error

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
      setEditCategory('')
    } else {
      setIsNewCategory(false)
      setEditCategory(val)
    }
  }

  const effectiveCategory = isNewCategory ? newCategoryValue : editCategory

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  const getDaysSinceSaved = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const handleSaveEdit = async () => {
    setError('')

    if (!editTitle.trim() || !effectiveCategory.trim()) {
      setError('Title and category are required')
      return
    }

    setIsSaving(true)

    try {
      const tagArray = editTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const { error: updateError } = await supabase
        .from('items')
        .update({
          title: editTitle.trim(),
          category: effectiveCategory.trim(),
          subcategory: editSubcategory.trim() || null,
          tags: tagArray,
          notes: editNotes.trim() || null,
          url: editUrl.trim() || null,
        })
        .eq('id', item.id)

      if (updateError) throw updateError

      setIsEditing(false)
      setIsNewCategory(false)
      setNewCategoryValue('')
      onItemUpdated()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(item.title)
    setEditCategory(item.category)
    setIsNewCategory(false)
    setNewCategoryValue('')
    setEditSubcategory(item.subcategory || '')
    setEditTags((item.tags || []).join(', '))
    setEditNotes(item.notes || '')
    setEditUrl(item.url || '')
    setError('')
  }

  const daysSince = getDaysSinceSaved(item.date_saved)

  if (isEditing) {
    return (
      <div className={`item-card ${item.status} editing`}>
        <div className="edit-form">
          <div className="form-header">
            <h3>Edit Item</h3>
          </div>

          <div className="form-group">
            <label htmlFor={`title-${item.id}`}>Title *</label>
            <input
              id={`title-${item.id}`}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor={`category-${item.id}`}>Category *</label>

              {/* Dropdown — current category pre-selected */}
              <select
                id={`category-${item.id}`}
                value={isNewCategory ? '__new__' : editCategory}
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
                  id={`new-category-${item.id}`}
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
              <label htmlFor={`subcategory-${item.id}`}>Subcategory</label>
              <input
                id={`subcategory-${item.id}`}
                type="text"
                value={editSubcategory}
                onChange={(e) => setEditSubcategory(e.target.value)}
                placeholder="e.g., lenses (optional)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`url-${item.id}`}>URL (optional)</label>
            <input
              id={`url-${item.id}`}
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor={`tags-${item.id}`}>Tags (comma separated, optional)</label>
            <input
              id={`tags-${item.id}`}
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="e.g., urgent, review, budget"
            />
          </div>

          <div className="form-group">
            <label htmlFor={`notes-${item.id}`}>Notes (markdown supported, optional)</label>
            <textarea
              id={`notes-${item.id}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add any notes here... **bold**, *italic*, [link](url)"
              rows={4}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button onClick={handleSaveEdit} disabled={isSaving} className="submit-btn">
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={handleCancelEdit} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`item-card ${item.status}`}>
      <div className="item-header" onClick={onToggleExpand}>
        <div className="item-title-section">
          <button className="expand-btn">{isExpanded ? '▼' : '▶'}</button>
          <div className="item-title-content">
            <h3 className="item-title">{item.title}</h3>
            <div className="item-meta">
              <span className="category-badge">{item.category}</span>
              {item.subcategory && (
                <span className="subcategory-badge">{item.subcategory}</span>
              )}
              <span className="date-badge">
                {formatDate(item.date_saved)} ({daysSince} days ago)
              </span>
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="item-content">
          {item.url && (
            <div className="item-url">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                🔗 {item.url}
              </a>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="item-tags">
              {item.tags.map((tag: string, idx: number) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.notes && (
            <div className="item-notes markdown-content">
              <ReactMarkdown>{item.notes}</ReactMarkdown>
            </div>
          )}

          <div className="item-actions">
            <button onClick={() => setIsEditing(true)} className="action-btn edit-btn">
              Edit
            </button>
            {item.status === 'new' && (
              <button onClick={onMarkReviewed} className="action-btn reviewed-btn">
                Mark Reviewed
              </button>
            )}
            {item.status !== 'archived' && (
              <button onClick={onArchive} className="action-btn archive-btn">
                Archive
              </button>
            )}
            <button onClick={onDelete} className="action-btn delete-btn">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
