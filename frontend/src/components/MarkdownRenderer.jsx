import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 在模块级别配置 marked，避免每次渲染重新配置
marked.setOptions({
  breaks: true,      // 支持换行
  gfm: true,         // GitHub Flavored Markdown
  headerIds: true,   // 为标题生成 ID
});

/**
 * Markdown 渲染组件
 * 将 Markdown 文本转换为 HTML 并渲染
 * 使用 DOMPurify 防止 XSS 攻击
 */
export default function MarkdownRenderer({ content }) {
  const html = useMemo(() => {
    if (!content) return '';
    // 解析 Markdown，再用 DOMPurify 清洗 HTML 防止 XSS
    const rawHtml = marked.parse(content);
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
