import { useState } from 'react';

/**
 * 项目卡片组件
 * 展示项目基本信息，点击展开详情
 */
export default function ProjectCard({ project, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="project-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(project)}
    >
      {/* 项目图标/封面 */}
      <div className="project-card-header">
        <div className="project-icon">
          {project.name.charAt(0)}
        </div>
        {project.featured && (
          <span className="featured-badge">精选</span>
        )}
      </div>

      {/* 项目信息 */}
      <div className="project-card-body">
        <h3>{project.name}</h3>
        <p className="project-desc">{project.description}</p>

        {/* 技术栈标签 */}
        <div className="tech-stack">
          {project.techStack?.slice(0, 5).map(tech => (
            <span key={tech} className="tech-tag">{tech}</span>
          ))}
          {project.techStack?.length > 5 && (
            <span className="tech-tag more">+{project.techStack.length - 5}</span>
          )}
        </div>
      </div>

      {/* 悬停时的操作按钮 */}
      <div className={`project-actions ${isHovered ? 'visible' : ''}`}>
        <span className="view-detail">查看详情 →</span>
      </div>
    </div>
  );
}
