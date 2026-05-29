import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Star, Heart, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../utils/context/theme-context';

interface Comment {
  id: string;
  text: string;
  name?: string;
  company?: string;
  likes: number;
  rating: number;
  timestamp: any;
}

interface CommentsProps {
  productId: string;
  onCommentsUpdate?: (count: number) => void;
  commentType?: 'product' | 'blog';
}

const getTimestampValue = (value: Comment['timestamp']) => {
  if (value && typeof value === 'object') {
    if ('toMillis' in value && typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if ('seconds' in value && typeof value.seconds === 'number') {
      return value.seconds * 1000;
    }
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
};

const Comments = ({
  productId,
  onCommentsUpdate,
  commentType = 'product',
}: CommentsProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const savedName = localStorage.getItem('commenterName');
    if (savedName) setName(savedName);
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Comment)
        .sort((left, right) => getTimestampValue(right.timestamp) - getTimestampValue(left.timestamp));

      setComments(fetched);

      if (onCommentsUpdate) onCommentsUpdate(fetched.length);
    } catch (error) {
      console.error('Unable to load comments:', error);
      setComments([]);

      if (onCommentsUpdate) onCommentsUpdate(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const finalName = name.trim() || t('commentsFunction.anonymous');
    localStorage.setItem('commenterName', finalName);

    const commentData: any = {
      productId,
      text: newComment.trim(),
      name: finalName,
      rating,
      likes: 0,
      timestamp: serverTimestamp(),
    };

    const trimmedCompany = company.trim();
    if (trimmedCompany) commentData.company = trimmedCompany;

    await addDoc(collection(db, 'comments'), commentData);

    setNewComment('');
    setRating(5);
    setCompany('');
    fetchComments();
  };

  const handleLike = async (commentId: string, currentLikes: number) => {
    const likedKey = `liked-${commentId}`;
    const isLiked = localStorage.getItem(likedKey) === 'true';
    const incrementValue = isLiked ? -1 : 1;

    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: increment(incrementValue),
    });

    localStorage.setItem(likedKey, String(!isLiked));
    fetchComments();
  };

  const isCommentLiked = (commentId: string) =>
    localStorage.getItem(`liked-${commentId}`) === 'true';

  return (
    <div className="mt-2 mb-12">
      <div className="space-y-6">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
          >
            {commentType === 'product' && comment.rating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(comment.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  ({comment.rating}/5)
                </span>
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-300 italic mb-4">
              "{comment.text}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {comment.name
                      ? comment.name.split(' ').map((n) => n[0]).join('')
                      : t('commentsFunction.anonymousInitial')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {comment.name || t('commentsFunction.anonymous')}{' '}
                    {comment.company ? (
                      <em className="text-gray-500 dark:text-gray-400">
                        {t('commentsFunction.fromCompany', { company: comment.company })}
                      </em>
                    ) : (
                      ''
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleLike(comment.id, comment.likes)}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isCommentLiked(comment.id)
                    ? 'text-red-500 hover:text-red-700'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                aria-label={
                  isCommentLiked(comment.id)
                    ? t('commentsFunction.unlike')
                    : t('commentsFunction.like')
                }
              >
                {isCommentLiked(comment.id) ? (
                  <Heart className="h-5 w-5 fill-current" />
                ) : (
                  <ThumbsUp className="h-5 w-5" />
                )}
                <span>({comment.likes})</span>
              </button>
            </div>
          </div>
        ))}

        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
        >
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('commentsFunction.placeholderName')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brandblue"
              />
            </div>
            <div>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t('commentsFunction.placeholderCompany')}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brandblue"
              />
            </div>
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brandblue"
                placeholder={t('commentsFunction.placeholderText')}
              />
            </div>

            {commentType === 'product' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">{t('commentsFunction.rating')}:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                      aria-label={t('commentsFunction.rateStar', { star })}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">({rating}/5)</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 bg-brandblue dark:bg-brandgreen text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brandblue focus:ring-offset-2"
            >
              {t('commentsFunction.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Comments;
