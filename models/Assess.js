var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 考核
var AssessSchema = new Schema({
  // 考核类型
  // 1.自我考核，2.互相考核
  type: {
    type: String,
    required: true
  },
  // 开始时间
  start_time: {
    type: Date,
    required: true
  },
  // 结束时间
  end_time: {
    type: Date,
    required: true
  },
  // 考核名称
  name: {
    type: String,
    required: true
  },
  // 考核目标
  target: {
    type: String,
    required: true
  },
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('assess', AssessSchema);
