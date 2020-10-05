var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 考核模版
var SendMessageLogSchema = new Schema({
  // 手机号
  phone: {
    unique: true,
    type: String,
    required: true
  },
  // 上次短信发送时间
  last_sms_time: {
    type: Date,
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

SendMessageLogSchema.index({ phone: 1 });

module.exports = mongoose.model('send_message_logs', SendMessageLogSchema);
