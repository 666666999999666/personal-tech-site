import { useEffect, useState, useCallback } from 'react';
import { api } from '../core/api/request.js';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectDetail from '../components/ProjectDetail.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter, setFilter] = useState('all'); // all, featured

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const data = await api.get('/api/projects');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectProject = useCallback((project) => {
    setSelectedProject(project);
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedProject(null);
    // 恢复背景滚动
    document.body.style.overflow = '';
  }, []);

  // 过滤项目
  const filteredProjects = filter === 'featured'
    ? projects.filter(p => p.featured)
    : projects;

  // 提取所有技术栈（去重）
  const allTechStacks = [...new Set(projects.flatMap(p => p.techStack || []))];

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;

  return (
    <div className="projects-page">
      <h1>项目展示</h1>

      {/* 筛选标签 */}
      <div className="projects-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部项目
        </button>
        <button
          className={`filter-btn ${filter === 'featured' ? 'active' : ''}`}
          onClick={() => setFilter('featured')}
        >
          精选项目
        </button>
      </div>

      {/* 技术栈统计 */}
      <div className="tech-stats">
        <span className="tech-stats-label">技术栈:</span>
        {allTechStacks.slice(0, 8).map(tech => (
          <span key={tech} className="tech-stat-tag">{tech}</span>
        ))}
        {allTechStacks.length > 8 && (
          <span className="tech-stat-tag more">+{allTechStacks.length - 8}</span>
        )}
      </div>

      {/* 项目卡片网格 */}
      <div className="project-grid">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={handleSelectProject}
          />
        ))}
      </div>

      {/* 项目详情弹窗 */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
