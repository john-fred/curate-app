'use client'

import { useState } from 'react'
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
  const [editSubcategory, setEditSubcategory] = useState(item.subcategory || '')
  const [editTags, setEditTags] = useState((item.tags || []).join(', '))
  const [editNotes, setEditNotes] = useState(item.notes || '')
  const [editUrl, setEditUrl] = useState(item.url || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
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

    if (!editTitle.trim() || !editCategory.trim()) {
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
          category: editCategory.trim(),
          subcategory: editSubcategory.trim() || null,
          tags: tagArray,
          notes: editNotes.trim() || null,
          url: editUrl.trim() || null,
        })
        .eq('id', item.id)

      if (updateError) throw updateError

      setIsEditing(false)
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
              <input
                id={`category-${item.id}`}
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`subcategory-${item.id}`}>Subcategory</label>
              <input
                id={`subcategory-${item.id}`}
                type="text"
                value={editSubcategory}
                onChange={(e) => setEditSubcategory(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor={`url-${item.id}`}>URL</label>
            <input
              id={`url-${item.id}`}
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`tags-${item.id}`}>Tags (comma separated)</label>
            <input
              id={`tags-${item.id}`}
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor={`notes-${item.id}`}>Notes (markdown supported)</label>
            <textarea
              id={`notes-${item.id}`}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="submit-btn"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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
                  #{tag}
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
