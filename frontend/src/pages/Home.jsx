import { useEffect, useState } from 'react';
import ParticleBackground from '../components/ParticleBackground.jsx';
import TypeWriter from '../components/TypeWriter.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 页面加载完成后触发入场动画
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const techStack = [
    'React', 'Vite', 'Express', 'MongoDB', 'Node.js', 'TypeScript',
    'Tailwind CSS', 'Docker', 'AI Agent', 'LLM'
  ];

  const projects = [
    {
      name: '个人技术网站',
      desc: '基于React + Vite + Express的全栈项目，包含自定义Router、Store、API层',
      tags: ['React', 'Express', 'MongoDB'],
    },
    {
      name: 'AI Agent 系统',
      desc: '基于大语言模型的智能Agent系统，支持流式通信和工具调用',
      tags: ['AI', 'LLM', 'Node.js'],
    },
    {
      name: '实时数据平台',
      desc: '高性能实时数据处理平台，支持WebSocket和SSE流式推送',
      tags: ['WebSocket', 'SSE', 'React'],
    },
  ];

  const learning = [
    'React 源码深入理解',
    '前端工程化与构建工具',
    'AI Agent 系统架构',
    '云原生与DevOps',
    '分布式系统设计',
    '大模型应用开发',
  ];

  return (
    <div className="home-page">
      <ParticleBackground />

      {/* Hero 区域 */}
      <section className={`hero ${isLoaded ? 'loaded' : ''}`}>
        <div className="hero-content">
          <h1>
            <TypeWriter text="欢迎来到我的技术空间" speed={80} />
          </h1>
          <p className="hero-subtitle">
            <TypeWriter
              text="全栈开发工程师 | 热爱技术 | 持续学习"
              speed={60}
              delay={1500}
            />
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">年开发经验</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">20+</span>
              <span className="stat-label">项目实战</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">热爱技术</span>
            </div>
          </div>
        </div>
      </section>

      {/* 技术栈 */}
      <ScrollReveal>
        <section className="tech-stack">
          <h2>技术栈</h2>
          <div className="stack-grid">
            {techStack.map((tech, index) => (
              <div
                key={tech}
                className="stack-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tech}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 项目经历 */}
      <ScrollReveal delay={200}>
        <section className="projects-preview">
          <h2>项目经历</h2>
          <div className="project-preview-grid">
            {projects.map((project) => (
              <div key={project.name} className="project-preview-card">
                <h3>{project.name}</h3>
                <p>{project.desc}</p>
                <div className="project-preview-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tech-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 学习方向 */}
      <ScrollReveal delay={400}>
        <section className="learning">
          <h2>学习方向</h2>
          <div className="learning-grid">
            {learning.map((item, index) => (
              <div
                key={item}
                className="learning-item"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="learning-icon">▸</span>
                {item}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
