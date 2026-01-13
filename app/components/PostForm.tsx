'use client'

import { useState } from 'react'
import { createPost } from '@/app/lib/posts'
import { useAuth } from '@/app/lib/useAuth'

export default function PostForm() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await createPost(user.uid, content)
      setContent('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass p-4 rounded-xl space-y-3"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今なにしてる？"
        maxLength={500}
        className="w-full resize-none bg-transparent outline-none"
        rows={3}
      />

      <div className="flex justify-end">
        <button
          disabled={loading || !content.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          投稿
        </button>
      </div>
    </form>
  )
}
