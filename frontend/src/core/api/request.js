/**
 * 自定义 API 请求层 - 基于原生 fetch
 * 类比 Java: 类似 RestTemplate / WebClient
 */

// 开发环境通过Vite proxy转发，生产环境可配置为实际后端地址
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * 统一请求方法
 * @param {string} method - HTTP方法
 * @param {string} path - 请求路径
 * @param {Object} [data] - 请求体
 * @returns {Promise<Object>} 响应数据
 */
async function _request(method, path, data = null) {
  const url = `${BASE_URL}${path}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    // 网络错误（断网、DNS失败、CORS等）
    throw new ApiError('网络请求失败，请检查网络连接', 0, { originalError: error.message });
  }

  // 解析响应体
  let responseData;
  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  // 检查HTTP状态码
  if (!response.ok) {
    throw new ApiError(
      responseData?.message || `请求失败: ${response.status}`,
      response.status,
      responseData
    );
  }

  return responseData;
}

/**
 * API 客户端
 */
export const api = {
  /**
   * GET 请求
   * @param {string} path
   * @returns {Promise<Object>}
   */
  get(path) {
    return _request('GET', path);
  },

  /**
   * POST 请求
   * @param {string} path
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  post(path, data) {
    return _request('POST', path, data);
  },

  /**
   * PUT 请求
   * @param {string} path
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  put(path, data) {
    return _request('PUT', path, data);
  },

  /**
   * DELETE 请求
   * @param {string} path
   * @returns {Promise<Object>}
   */
  delete(path) {
    return _request('DELETE', path);
  },
};
