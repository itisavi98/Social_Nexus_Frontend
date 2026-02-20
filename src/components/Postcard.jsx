import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiBookmark, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(Number(post.user_liked) > 0);
  const [likeCount, setLikeCount] = useState(Number(post.like_count));
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    try {
      const { data } = await API.post(`/posts/${post.post_id}/like`);
      setLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch { toast.error('Failed to like'); }
  };

  const handleSave = async () => {
    try {
      await API.post(`/posts/${post.post_id}/watchlist`);
      setSaved(true);
      toast.success('Saved to watchlist');
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/posts/${post.post_id}`);
      toast.success('Post deleted');
      if (onDelete) onDelete(post.post_id);
    } catch { toast.error('Failed to delete'); }
  };

  const displayName = post.first_name ? `${post.first_name} ${post.last_name || ''}`.trim() : post.username;
  const timeAgo = post.post_date ? formatDistanceToNow(new Date(post.post_date), { addSuffix: true }) : '';

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.user_id}`}>
          <div className="avatar">
            {post.photo ? <img src={post.photo} alt="" /> : displayName[0]?.toUpperCase()}
          </div>
        </Link>
        <div className="post-header-info">
          <Link to={`/profile/${post.user_id}`} className="post-user-name">{displayName}</Link>
          <div className="post-date">{timeAgo}</div>
        </div>
        {user?.user_id === post.user_id && (
          <button className="btn btn-ghost btn-sm" onClick={handleDelete} title="Delete">
            <FiTrash2 />
          </button>
        )}
      </div>

      {post.content && <div className="post-content">{post.content}</div>}

      {post.tags && (
        <div className="post-tags">
          {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      )}

      {post.image && post.media_type === 'image' && (
        <img src={post.image} alt="post" className="post-image" loading="lazy" />
      )}

      {post.video && post.media_type === 'video' && (
        <video src={post.video} controls className="post-image" />
      )}

      <div className="post-actions">
        <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <FiHeart /> {likeCount}
        </button>
        <Link to={`/post/${post.post_id}`} className="action-btn" style={{textDecoration:'none'}}>
          <FiMessageCircle /> {Number(post.comment_count) || 0}
        </Link>
        <div className="post-actions-right">
          <button className={`action-btn ${saved ? 'liked' : ''}`} onClick={handleSave} title="Save to watchlist">
            <FiBookmark />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
