/**
 * 自定义 Store - 基于发布-订阅模式
 * 类比 Spring: 类似 ApplicationContext（单例Bean容器 + 事件机制）
 * 类比 Java: 类似 EventBus / Observable
 */

/**
 * 创建全局状态存储
 * @param {Object} initialState - 初始状态
 * @returns {Object} { getState, setState, subscribe }
 */
export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();  // 使用Set避免重复订阅者

  /**
   * 获取当前状态
   * @returns {Object} 当前状态的副本
   */
  function getState() {
    return { ...state };
  }

  /**
   * 设置状态（支持部分更新）
   * @param {Object|Function} partial - 部分状态或更新函数
   */
  function setState(partial) {
    let nextState;

    if (typeof partial === 'function') {
      // 函数式更新：基于当前状态计算新状态
      nextState = { ...state, ...partial(state) };
    } else {
      // 对象式更新：浅合并
      nextState = { ...state, ...partial };
    }

    // 浅比较：如果状态没变，不通知
    // 比较逻辑：
    // 1. 比较 key 数量是否变化（检测新增/删除）
    // 2. 比较每个 key 的值是否变化
    const stateKeys = Object.keys(state);
    const nextStateKeys = Object.keys(nextState);
    const hasChanged = stateKeys.length !== nextStateKeys.length ||
      nextStateKeys.some(key => state[key] !== nextState[key]);
    if (!hasChanged) return;

    state = nextState;

    // 通知所有订阅者
    listeners.forEach(listener => {
      try {
        listener(state);
      } catch (e) {
        console.error('Store listener error:', e);
      }
    });
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 回调函数 (state) => void
   * @returns {Function} 取消订阅函数
   */
  function subscribe(listener) {
    listeners.add(listener);
    // 不立即通知，避免 useEffect 中额外渲染
    // 组件可通过 getState() 获取当前状态
    return () => {
      listeners.delete(listener);
    };
  }

  return { getState, setState, subscribe };
}

/**
 * 创建应用全局Store
 */
export const store = createStore({
  // 博客状态
  blogs: [],
  currentBlog: null,

  // 项目状态
  projects: [],
});
