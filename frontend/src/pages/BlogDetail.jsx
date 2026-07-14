import { useEffect, useState } from 'react';
import { useParams } from '../hooks/useParams.js';
import { api } from '../core/api/request.js';
import MarkdownRenderer from '../components/MarkdownRenderer.jsx';
import router from '../core/router/router.js';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  async function fetchBlog(blogId) {
    try {
      setLoading(true);
      const data = await api.get(`/api/blogs/${blogId}`);
      setBlog(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;
  if (!blog) return <div className="not-found">博客不存在</div>;

  return (
    <div className="blog-detail-page">
      {/* 返回按钮 */}
      <button className="back-btn" onClick={() => router.push('/blog')}>
        ← 返回列表
      </button>

      <h1>{blog.title}</h1>

      <div className="blog-meta">
        <span>创建时间: {new Date(blog.createdAt).toLocaleDateString('zh-CN')}</span>
        {blog.updatedAt !== blog.createdAt && (
          <span>更新于: {new Date(blog.updatedAt).toLocaleDateString('zh-CN')}</span>
        )}
      </div>

      {/* 标签 */}
      <div className="blog-tags detail-tags">
        {blog.tags?.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {/* Markdown 内容 */}
      <div className="blog-content-wrapper">
        <MarkdownRenderer content={blog.content} />
      </div>
    </div>
  );
}
