var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾月报汇总
var DomesticGarbageMonthlySummarySchema = new Schema({
  // 填报日期
  time: {
    type: Number,
    unique: true,
    required: true
  },
  // 垃圾收集情况
  kitchen_waste: { // 厨余垃圾(公斤)
    type: Number,
    required: true
  },
  recyclable_waste: { // 可回收垃圾(公斤)
    type: Number,
    required: true
  },
  harmful_waste: { // 有害垃圾(公斤)
    type: Number,
    required: true
  },
  bulky_waste: { // 大件垃圾(公斤)
    type: Number,
    required: true
  },
  other_waste: { // 其他垃圾(公斤)
    type: Number,
    required: true
  },
  report_count: { // 总计报告数目
    type: Number,
    required: true,
    default: 0
  },
  is_expired: {  // 数据是否过期,
    type: Boolean,
    required: true,
    default: true,
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('domestic_garbage_monthly_summary', DomesticGarbageMonthlySummarySchema);
