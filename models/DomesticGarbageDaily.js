var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾日报
var DomesticGarbageDailySchema = new Schema({
  // 填报人id
  // 机构id
  // 填报日期
  // 分类管理工作会议
  meeting_times: { // 管理工作会议次数
    type: Number,
    required: true
  },
  meeting_host: { // 管理工作会议主持人
    type: String,
    required: true
  },
  meeting_content: { // 会议具体事项
    type: String,
    required: true
  },
  
  // 自测、巡查
  self_inspection_times: { //  自测、巡查次数
    type: Number,
    required: true
  },
  self_inspection_problems: { // 存在问题数目
    type: Number,
    required: true
  },
  self_inspection_content: { // 主要涉及问题
    type: String,
    required: true
  },
  self_inspection_corrected: { // 是否改正到位
    type: Boolean,
    required: true
  },
  
  // 分类宣传
  advertise_times: { //  宣传次数
    type: Number,
    required: true
  },
  advertise_content: { // 宣传方式
    type: String,
    required: true
  },
  
  // 分类培训
  traning_times: { //  培训次数
    type: Number,
    required: true
  },
  trainees: { //  培训人数
    type: Number,
    required: true
  },
  traning_content: { // 培训内容
    type: String,
    required: true
  },
  
  // 政府检查
  gov_inspection_times: { //  检查次数
    type: Number,
    required: true
  },
  gov_inspection_problems: { // 存在问题数目
    type: Number,
    required: true
  },
  gov_inspection_content: { // 主要涉及问题
    type: String,
    required: true
  },
  gov_inspection_corrected: { // 是否改正到位
    type: Boolean,
    required: true
  },
  
}, {timestamps: {create_time: 'created', update_time: 'updated'}});

module.exports = mongoose.model('DomesticGarbageDaily', DomesticGarbageDailySchema);
