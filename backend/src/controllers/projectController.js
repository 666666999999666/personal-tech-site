const projectService = require('../services/projectService');

// 输入校验辅助函数
function validateProject(data) {
  const { name, description } = data;
  const errors = [];
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('name 不能为空');
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    errors.push('description 不能为空');
  }
  return errors;
}

const projectController = {
  getAll: async (req, res) => {
    try {
      const projects = await projectService.getAll();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: '获取项目列表失败' });
    }
  },

  create: async (req, res) => {
    const errors = validateProject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }
    try {
      const project = await projectService.create({
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        longDescription: req.body.longDescription?.trim() || '',
        techStack: Array.isArray(req.body.techStack) ? req.body.techStack : [],
        githubUrl: req.body.githubUrl?.trim() || null,
        demoUrl: req.body.demoUrl?.trim() || null,
        featured: Boolean(req.body.featured),
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: '创建项目失败' });
    }
  },

  getById: async (req, res) => {
    try {
      const project = await projectService.getById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: '项目不存在' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: '获取项目详情失败' });
    }
  },

  update: async (req, res) => {
    const errors = validateProject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }
    try {
      const project = await projectService.update(req.params.id, {
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        longDescription: req.body.longDescription?.trim() || '',
        techStack: Array.isArray(req.body.techStack) ? req.body.techStack : [],
        githubUrl: req.body.githubUrl?.trim() || null,
        demoUrl: req.body.demoUrl?.trim() || null,
        featured: Boolean(req.body.featured),
      });
      if (!project) {
        return res.status(404).json({ message: '项目不存在' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: '更新项目失败' });
    }
  },

  remove: async (req, res) => {
    try {
      const success = await projectService.remove(req.params.id);
      if (!success) {
        return res.status(404).json({ message: '项目不存在' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: '删除项目失败' });
    }
  },
};

module.exports = projectController;
