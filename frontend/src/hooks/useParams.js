import { useState, useEffect } from 'react';
import router from '../core/router/router.js';

/**
 * 获取当前路由参数
 * 类比 react-router 的 useParams
 * @returns {Object} 路由参数对象
 */
export function useParams() {
  const [params, setParams] = useState(router.currentParams || {});

  useEffect(() => {
    // 订阅路由变化，更新参数
    const unsubscribe = router.subscribe((_component, newParams) => {
      setParams({ ...newParams });
    });
    return unsubscribe;
  }, []);

  return params;
}
