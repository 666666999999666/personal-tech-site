import { useState, useEffect, lazy, Suspense } from 'react';
import router from './core/router/router.js';
import NavBar from './components/NavBar.jsx';

// 页面组件 - 懒加载
const Home = lazy(() => import('./pages/Home.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const Agent = lazy(() => import('./pages/Agent.jsx'));

/**
 * App组件 - 路由容器
 * 类比 Spring: 类似 DispatcherServlet 分发请求到不同Controller
 */
function App() {
  const [CurrentPage, setCurrentPage] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    // 注册路由
    router.addRoute('/', Home);
    router.addRoute('/blog', Blog);
    router.addRoute('/blog/:id', BlogDetail);
    router.addRoute('/projects', Projects);
    router.addRoute('/agent', Agent);

    // 订阅路由变化
    const unsubscribe = router.subscribe((component, params) => {
      setCurrentPage(() => component);
      setRouteParams(params);
    });

    // 初始化路由，获取清理函数
    const cleanupRouter = router.init();

    return () => {
      unsubscribe();
      cleanupRouter();
    };
  }, []);

  return (
    <div className="app">
      <NavBar />
      <main className="main-content" role="main">
        <Suspense fallback={<div className="loading">加载中...</div>}>
          {CurrentPage ? (
            <CurrentPage {...routeParams} />
          ) : (
            <div className="not-found" role="alert">404 - 页面不存在</div>
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
