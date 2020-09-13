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
}, {timestamps: {create_time: 'created', update_time: 'updated'}});

module.exports = mongoose.model('Message', MessageSchema);
