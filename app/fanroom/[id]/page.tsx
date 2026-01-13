'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { ArrowLeft, Heart, MessageCircle, Check, Send, Image as ImageIcon, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

interface VTuberData {
  id: string;
  displayName: string;
  username: string;
  bio?: string;
  isVerified: boolean;
  userType: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}

export default function FanroomPage() {
  const router = useRouter();
  const params = useParams();
  const vtuberId = params.id as string;

  const [vtuber, setVtuber] = useState<VTuberData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        loadVTuberData();
        loadPosts();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [vtuberId]);

  const loadVTuberData = async () => {
    try {
      const docRef = doc(db, 'users', vtuberId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setVtuber({ id: docSnap.id, ...docSnap.data() } as VTuberData);
      }
    } catch (error) {
      console.error('VTuberデータ取得エラー:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', vtuberId),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      console.log('投稿取得:', postList); // デバッグ用
      setPosts(postList);
    } catch (error) {
      console.error('投稿取得エラー:', error);
      // Firestoreのインデックスエラーの場合
      if (error.code === 'failed-precondition') {
        alert('Firestoreのインデックスを作成してください。コンソールのリンクをクリックしてください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !currentUserId || isPosting) return;

    setIsPosting(true);
    try {
      let imageUrl = '';
      
      // 画像をアップロード
      if (imageFile) {
        const storageRef = ref(storage, `posts/${currentUserId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const newPostData = {
        userId: currentUserId,
        content: newPost,
        imageUrl: imageUrl || null,
        isApproved: true,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('投稿データ:', newPostData); // デバッグ用
      const docRef = await addDoc(collection(db, 'posts'), newPostData);
      console.log('投稿ID:', docRef.id); // デバッグ用

      setNewPost('');
      setImageFile(null);
      setImagePreview('');
      
      // 投稿後すぐに再読み込み
      await loadPosts();
      alert('投稿しました！');
    } catch (error) {
      console.error('投稿エラー:', error);
      alert('投稿に失敗しました: ' + error.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleLike = async (postId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(1),
      });

      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likesCount: post.likesCount + 1, isLiked: true }
          : post
      ));
    } catch (error) {
      console.error('いいねエラー:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      setComments(commentList);
    } catch (error) {
      console.error('コメント取得エラー:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      const userData = userDoc.data();

      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: currentUserId,
        userName: userData?.displayName || 'Unknown',
        content: newComment,
        createdAt: new Date(),
      });

      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentsCount: increment(1),
      });

      setNewComment('');
      loadComments(postId);
      loadPosts();
    } catch (error) {
      console.error('コメントエラー:', error);
    }
  };

  const openComments = (postId: string) => {
    setSelectedPost(postId);
    loadComments(postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 slide-in-top">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{vtuber?.displayName}</h1>
                {vtuber?.isVerified && (
                  <Check className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">@{vtuber?.username}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* VTuberプロフィール */}
        <div className="glass rounded-3xl shadow-xl p-8 mb-6 backdrop-blur-xl border border-white/20 scale-in">
          <h2 className="text-3xl font-bold mb-3 gradient-text">{vtuber?.displayName}のファンルーム</h2>
          {vtuber?.bio && <p className="text-gray-700 text-lg">{vtuber.bio}</p>}
        </div>

        {/* 投稿作成（VTuberのみ） */}
        {currentUserId === vtuberId && (
          <div className="glass rounded-3xl shadow-lg p-6 mb-6 backdrop-blur-xl border border-white/20 slide-in-bottom">
            <h3 className="font-bold mb-3">投稿を作成</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="今何してる？"
              className="w-full px-4 py-3 glass border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-sm transition-all"
              rows={3}
            />
            
            {/* 画像プレビュー */}
            {imagePreview && (
              <div className="relative mt-3">
                <img src={imagePreview} alt="Preview" className="w-full rounded-lg" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <label className="flex items-center gap-2 px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all transform hover:scale-105 cursor-pointer font-bold">
                <ImageIcon className="w-5 h-5" />
                画像を追加
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim() || isPosting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPosting ? '投稿中...' : '投稿'}
              </button>
            </div>
          </div>
        )}

        {/* 投稿一覧 */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="glass rounded-3xl shadow-lg p-12 text-center backdrop-blur-xl border border-white/20 scale-in">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">まだ投稿がありません</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post.id} className="glass rounded-3xl shadow-lg p-6 backdrop-blur-xl border border-white/20 card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                
                {/* 投稿画像 */}
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="w-full rounded-lg mb-4" />
                )}

                <div className="flex items-center gap-6 text-gray-600">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={post.isLiked}
                    className="flex items-center gap-2 hover:text-red-500 transition-all disabled:opacity-50 transform hover:scale-110 active:scale-95"
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => openComments(post.id)}
                    className="flex items-center gap-2 hover:text-purple-500 transition-all transform hover:scale-110"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.commentsCount}</span>
                  </button>
                </div>

                {/* コメントセクション */}
                {selectedPost === post.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="コメントを入力..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {comment.userName}
                          </p>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}