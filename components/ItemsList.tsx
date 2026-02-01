'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ItemCard from '@/components/ItemCard'
import './ItemsList.css'

interface ItemsListProps {
  items: any[]
  onItemDeleted: () => void
}

export default function ItemsList({ items, onItemDeleted }: ItemsListProps) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  const handleMarkReviewed = async (itemId: string) => {
    try {
      await supabase
        .from('items')
        .update({
          status: 'reviewed',
          date_last_reviewed: new Date().toISOString(),
        })
        .eq('id', itemId)

      onItemDeleted() // Refresh items
    } catch (err) {
      console.error('Error updating item:', err)
    }
  }

  const handleArchive = async (itemId: string) => {
    try {
      await supabase
        .from('items')
        .update({ status: 'archived' })
        .eq('id', itemId)

      onItemDeleted() // Refresh items
    } catch (err) {
      console.error('Error archiving item:', err)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await supabase.from('items').delete().eq('id', itemId)
        onItemDeleted() // Refresh items
      } catch (err) {
        console.error('Error deleting item:', err)
      }
    }
  }

  return (
    <div className="items-list">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          isExpanded={expandedItemId === item.id}
          onToggleExpand={() =>
            setExpandedItemId(expandedItemId === item.id ? null : item.id)
          }
          onMarkReviewed={() => handleMarkReviewed(item.id)}
          onArchive={() => handleArchive(item.id)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  )
}
