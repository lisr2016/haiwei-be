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
    type: Object,
  },
  recyclable_waste: { // 可回收垃圾(公斤)
    type: Object,
  },
  harmful_waste: { // 有害垃圾(公斤)
    type: Object,
  },
  bulky_waste: { // 大件垃圾(公斤)
    type: Object,
  },
  other_waste: { // 其他垃圾(公斤)
    type: Object,
  },
  report_count: { // 总计报告数目
    type: Object,
  },
  is_expired: {  // 数据是否过期,
    type: Boolean,
    required: true,
    default: true,
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

DomesticGarbageMonthlySummarySchema.index({ time: 1 });

module.exports = mongoose.model('domestic_garbage_monthly_summary', DomesticGarbageMonthlySummarySchema);
