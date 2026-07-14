/**
 * 自定义 Router - 基于浏览器 History API
 * 类比 Spring: 类似 DispatcherServlet + @RequestMapping
 */
class Router {
  constructor() {
    this.routes = [];        // 路由表
    this.currentPath = '';     // 当前路径
    this.listeners = [];       // 路由变化监听者
    this.currentComponent = null; // 当前匹配的组件
    this.currentParams = {};   // 当前路由参数
    this._popstateHandler = null; // popstate 监听器引用（用于清理）
  }

  /**
   * 注册路由
   * @param {string} path - 路径，支持动态参数如 /blog/:id
   * @param {Function} component - React组件
   */
  addRoute(path, component) {
    const { regex, paramNames } = this._parsePath(path);
    this.routes.push({ path, regex, paramNames, component });
  }

  /**
   * 导航到新路径
   * @param {string} path - 目标路径
   */
  push(path) {
    if (path === this.currentPath) return;
    window.history.pushState({}, '', path);
    this._matchAndNotify(path);
  }

  /**
   * 替换当前路径
   * @param {string} path - 目标路径
   */
  replace(path) {
    window.history.replaceState({}, '', path);
    this._matchAndNotify(path);
  }

  /**
   * 后退
   */
  back() {
    window.history.back();
  }

  /**
   * 初始化：监听浏览器后退/前进
   * @returns {Function} 清理函数，移除 popstate 监听器
   */
  init() {
    // 保存引用，以便后续可移除
    this._popstateHandler = () => {
      this._matchAndNotify(window.location.pathname);
    };
    window.addEventListener('popstate', this._popstateHandler);
    // 初始匹配
    this._matchAndNotify(window.location.pathname);

    // 返回清理函数
    return () => {
      if (this._popstateHandler) {
        window.removeEventListener('popstate', this._popstateHandler);
        this._popstateHandler = null;
      }
    };
  }

  /**
   * 订阅路由变化
   * @param {Function} listener - 回调函数 (component, params) => void
   * @returns {Function} 取消订阅函数
   */
  subscribe(listener) {
    this.listeners.push(listener);
    // 立即通知当前状态
    if (this.currentComponent) {
      listener(this.currentComponent, this.currentParams);
    }
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== listener);
    };
  }

  /**
   * 匹配路径并通知所有监听者
   * @private
   */
  _matchAndNotify(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        // 提取参数
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });

        this.currentPath = path;
        this.currentComponent = route.component;
        this.currentParams = params;

        // 通知所有监听者
        this.listeners.forEach(fn => fn(route.component, params));
        return;
      }
    }

    // 404 - 未匹配到路由
    this.currentPath = path;
    this.currentComponent = null;
    this.currentParams = {};
    this.listeners.forEach(fn => fn(null, {}));
  }

  /**
   * 解析路径模板为正则表达式
   * '/blog/:id' → { regex: /^\/blog\/([^/]+)$/, paramNames: ['id'] }
   * @private
   */
  _parsePath(path) {
    const paramNames = [];
    // 转义特殊字符，替换 :param 为捕获组
    const regexStr = path
      .replace(/\//g, '\\/')  // 转义 /
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';  // 捕获非/字符
      });
    return {
      regex: new RegExp(`^${regexStr}/?$`),  // /?$ 允许尾部斜杠可选
      paramNames,
    };
  }
}

// 导出单例
const router = new Router();
export default router;
