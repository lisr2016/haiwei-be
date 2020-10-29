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
    default: false
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
  // 类型 1.普通消息,2.生活垃圾日报,3.生活垃圾周报,4.生活垃圾月报,5.医疗垃圾日报
  type: {
    type: String,
    required: true
  },
  publish_time : {
    type: Date
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

MessageSchema.index({ user_id: 1, updateAt: -1});

module.exports = mongoose.model('message', MessageSchema);
