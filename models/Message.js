var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 提醒信息
var MessageSchema = new Schema({
  // 接受人id
  user_id: {
    type: String,
    required: true
  },
  // 消息是否已读
  is_read: {
    type: Boolean,
    required: true
  },
  // 标题名称
  title: {
    type: String,
    required: true
  },
  // 消息内容
  content: {
    type: String,
    required: true
  },
  // 类型
  type: {
    type: String,
    required: true
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('message', MessageSchema);
