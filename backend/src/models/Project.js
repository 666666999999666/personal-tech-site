// Project 数据模型（Mongoose Schema）
// 类比 Java Spring: 相当于 @Entity 注解的实体类
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '项目名不能为空'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, '描述不能为空'],
    trim: true,
  },
  longDescription: {
    type: String,
    default: '',
  },
  techStack: [{
    type: String,
    trim: true,
  }],
  githubUrl: {
    type: String,
    default: null,
  },
  demoUrl: {
    type: String,
    default: null,
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, {
  // 自动管理 createdAt / updatedAt 字段
  timestamps: true,
  // 序列化时把 _id 转成 id，保持前端 API 契约不变
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

module.exports = mongoose.model('Project', projectSchema);
