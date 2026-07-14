// 项目服务层 - MongoDB 数据库操作
// 类比 Java Spring: 相当于 @Service + @Autowired ProjectRepository
const Project = require('../models/Project');

const projectService = {
  // 获取全部项目（按创建时间倒序）
  getAll: async () => {
    return await Project.find().sort({ createdAt: -1 });
  },

  // 根据 ID 获取单个项目
  getById: async (id) => {
    return await Project.findById(id);
  },

  // 创建项目
  create: async (data) => {
    const project = new Project(data);
    return await project.save();
  },

  // 更新项目
  update: async (id, data) => {
    return await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  // 删除项目，返回是否删除成功
  remove: async (id) => {
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  },
};

module.exports = projectService;
