import { useEffect, useState, useCallback } from 'react';
import { api } from '../core/api/request.js';
import router from '../core/router/router.js';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  // 搜索和标签过滤
  useEffect(() => {
    let result = blogs;

    // 标签过滤
    if (selectedTag) {
      result = result.filter(blog => blog.tags?.includes(selectedTag));
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog =>
        blog.title?.toLowerCase().includes(query) ||
        blog.content?.toLowerCase().includes(query) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredBlogs(result);
  }, [blogs, searchQuery, selectedTag]);

  async function fetchBlogs() {
    try {
      setLoading(true);
      const data = await api.get('/api/blogs');
      setBlogs(data);

      // 提取所有标签
      const tags = new Set();
      data.forEach(blog => {
        blog.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleTagClick = useCallback((tag) => {
    setSelectedTag(prev => prev === tag ? '' : tag);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  if (loading) return <div className="loading" role="status">加载中...</div>;
  if (error) return <div className="error" role="alert">错误: {error}</div>;

  return (
    <div className="blog-page">
      <h1>博客列表</h1>

      {/* 搜索栏 */}
      <div className="blog-search">
        <input
          type="text"
          placeholder="搜索博客标题、内容或标签..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
          aria-label="搜索博客"
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>
            清除
          </button>
        )}
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="blog-filter-tags">
          <span className="filter-label">标签筛选:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-tag ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button className="clear-filter" onClick={() => setSelectedTag('')}>
              清除筛选
            </button>
          )}
        </div>
      )}

      {/* 结果统计 */}
      <div className="blog-stats">
        共 {filteredBlogs.length} 篇博客
        {selectedTag && ` (标签: ${selectedTag})`}
        {searchQuery && ` (搜索: "${searchQuery}")`}
      </div>

      {/* 博客列表 */}
      <div className="blog-list">
        {filteredBlogs.length === 0 ? (
          <div className="empty-state">
            {searchQuery || selectedTag
              ? '没有找到匹配的博客'
              : '暂无博客'}
          </div>
        ) : (
          filteredBlogs.map(blog => (
            <article
              key={blog.id}
              className="blog-card"
              onClick={() => router.push(`/blog/${blog.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && router.push(`/blog/${blog.id}`)}
              tabIndex={0}
              role="link"
              aria-label={`阅读博客: ${blog.title}`}
            >
              <h3>{blog.title}</h3>
              <p className="blog-summary">
                {blog.content?.substring(0, 150)}...
              </p>
              <div className="blog-meta-line">
                <time className="blog-date" dateTime={blog.createdAt}>
                  {new Date(blog.createdAt).toLocaleDateString('zh-CN')}
                </time>
                <div className="blog-tags">
                  {blog.tags?.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
