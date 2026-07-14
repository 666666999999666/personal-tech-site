// Blog 数据模型（Mongoose Schema）
// 类比 Java Spring: 相当于 @Entity 注解的实体类
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, '内容不能为空'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
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

module.exports = mongoose.model('Blog', blogSchema);
