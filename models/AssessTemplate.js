var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 考核模版
var AssessTemplateSchema = new Schema({
  // 模板名称
  name: {
    type: String,
    required: true
  },
  // 考核内容
  content: [String]
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('assess_templates', AssessTemplateSchema);
