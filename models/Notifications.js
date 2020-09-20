var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationsSchema = new Schema({
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
  // 是否取消发布
  is_deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('notifications', NotificationsSchema);
