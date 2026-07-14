// 博客服务层 - MongoDB 数据库操作
// 类比 Java Spring: 相当于 @Service + @Autowired BlogRepository
const Blog = require('../models/Blog');

const blogService = {
  // 获取全部博客（按创建时间倒序）
  getAll: async () => {
    return await Blog.find().sort({ createdAt: -1 });
  },

  // 根据 ID 获取单篇博客
  getById: async (id) => {
    return await Blog.findById(id);
  },

  // 创建博客
  create: async (data) => {
    const blog = new Blog(data);
    return await blog.save();
  },

  // 更新博客
  // { new: true } 返回更新后的文档；{ runValidators: true } 运行 Schema 校验
  update: async (id, data) => {
    return await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  // 删除博客，返回是否删除成功
  remove: async (id) => {
    const result = await Blog.findByIdAndDelete(id);
    return !!result;
  },
};

module.exports = blogService;
