const blogService = require('../services/blogService');

// 输入校验辅助函数
function validateBlog(data) {
  const { title, content } = data;
  const errors = [];
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('title 不能为空');
  }
  if (!content || typeof content !== 'string' || !content.trim()) {
    errors.push('content 不能为空');
  }
  return errors;
}

const blogController = {
  getAll: (req, res) => {
    try {
      const blogs = blogService.getAll();
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ message: '获取博客列表失败' });
    }
  },

  create: (req, res) => {
    const errors = validateBlog(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }
    try {
      const blog = blogService.create({
        title: req.body.title.trim(),
        content: req.body.content.trim(),
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      });
      res.status(201).json(blog);
    } catch (error) {
      res.status(500).json({ message: '创建博客失败' });
    }
  },

  getById: (req, res) => {
    try {
      const blog = blogService.getById(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: '博客不存在' });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: '获取博客详情失败' });
    }
  },

  update: (req, res) => {
    const errors = validateBlog(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(', ') });
    }
    try {
      const blog = blogService.update(req.params.id, {
        title: req.body.title.trim(),
        content: req.body.content.trim(),
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      });
      if (!blog) {
        return res.status(404).json({ message: '博客不存在' });
      }
      res.json(blog);
    } catch (error) {
      res.status(500).json({ message: '更新博客失败' });
    }
  },

  remove: (req, res) => {
    try {
      const success = blogService.remove(req.params.id);
      if (!success) {
        return res.status(404).json({ message: '博客不存在' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: '删除博客失败' });
    }
  },
};

module.exports = blogController;
