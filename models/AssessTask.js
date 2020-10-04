var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 考核任务
var AssessTaskSchema = new Schema({
  // 考核模板id
  template_id: {
    type: String,
    required: true
  },
  // 考核类型
  // 1.自我考核，2.互相考核
  type: {
    type: String,
    required: false,
    default: '2'
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
  content: {
    type: String,
    required: true
  },
  // 考核单位,组织id
  assessor_id: {
    type: String,
    required: true
  },
  // 考核对象,组织id
  assessee_id: {
    type: String,
    required: true
  },
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

AssessTaskSchema.index({ assessee_id: 1,  assessor_id: -1});

module.exports = mongoose.model('assess_tasks', AssessTaskSchema);
