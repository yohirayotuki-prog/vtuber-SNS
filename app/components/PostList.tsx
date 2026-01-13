'use client'

import { useEffect, useState } from 'react'
import { subscribePosts, Post } from '@/app/lib/posts'

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const unsubscribe = subscribePosts(setPosts)
    return () => unsubscribe()
  }, [])

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <div
          key={post.id}
          className="glass p-4 rounded-xl"
        >
          <div className="text-sm text-gray-500 mb-1">
            {post.userId}
          </div>
          <p className="whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      ))}
    </div>
  )
}
