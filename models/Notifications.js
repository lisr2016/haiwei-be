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
  // 发布机构
  publisher: {
    type: String,
    required: true
  },
  // 发布人id
  userid: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('notifications', NotificationsSchema);
