import router from '../core/router/router.js';

export default function NavBar() {
  const navItems = [
    { path: '/', label: '首页' },
    { path: '/blog', label: '博客' },
    { path: '/projects', label: '项目' },
    { path: '/agent', label: 'Agent' },
  ];

  function handleClick(e, path) {
    e.preventDefault();
    router.push(path);
  }

  return (
    <nav className="navbar" role="navigation" aria-label="主导航">
      <div className="nav-brand">技术空间</div>
      <ul className="nav-links">
        {navItems.map(item => (
          <li key={item.path}>
            <a
              href={item.path}
              onClick={(e) => handleClick(e, item.path)}
              aria-current={window.location.pathname === item.path ? 'page' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
