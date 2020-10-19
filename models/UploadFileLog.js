var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 文件上传记录
var UploadFileLogSchema = new Schema({
  // 手机号 或者 'admin'
  uploader: {
    type: String,
    required: true
  },
  is_success: {
    type: Boolean,
    required: true
  },
  size : {
    type: Number,
    required: true
  },
  key: {
    type: String,
    required: true
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('upload_file_logs', UploadFileLogSchema);
