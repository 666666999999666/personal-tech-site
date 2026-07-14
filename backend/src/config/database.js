// MongoDB 数据库连接配置
// 类比 Java Spring: 相当于 application.yml 里的 spring.data.mongodb.uri 配置
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_tech_site';
    // mongoose 7+ 默认行为，connect 时不再需要 useNewUrlParser/useUnifiedTopology
    await mongoose.connect(uri);
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    // 连接失败直接退出进程，避免后端空转
    process.exit(1);
  }
};

module.exports = connectDB;
