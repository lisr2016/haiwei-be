var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 政策文件
var PolicySchema = new Schema({
  // 标题
  title: {
    type: String,
    required: true
  },
  // 内容
  content: {
    type: String,
    required: true
  },
  // 发布人id
  admin_id: {
    type: String,
    required: true
  },
  // 发布人username
  admin_name: {
    type: String,
  },
  // 是否取消发布
  is_deleted: {
    type: Boolean,
    default: false
  },
  // 文件类型
  type: {
    type: String,
    default: false
  },
  // 文件地址
  url: {
    type: String,
    default: false
  },
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});



module.exports = mongoose.model('policies', PolicySchema);
