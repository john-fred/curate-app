'use client'

import ReactMarkdown from 'react-markdown'
import './ItemCard.css'

interface ItemCardProps {
  item: any
  isExpanded: boolean
  onToggleExpand: () => void
  onMarkReviewed: () => void
  onArchive: () => void
  onDelete: () => void
}

export default function ItemCard({
  item,
  isExpanded,
  onToggleExpand,
  onMarkReviewed,
  onArchive,
  onDelete,
}: ItemCardProps) {
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

  const daysSince = getDaysSinceSaved(item.date_saved)

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
