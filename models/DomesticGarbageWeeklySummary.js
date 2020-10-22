var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾周报汇总
var DomesticGarbageWeeklySummarySchema = new Schema({
  // 填报日期
  time: {
    type: Date,
    unique: true,
    required: true
  },
  // 专兼职人员
  consignee: { // 收运人员
    type: Object,
  },
  guide: { // 看守引导人员
    type: Object,
  },
  inspector: { // 监督检查人员
    type: Object,
  },
  // 收集设施设备配置
  // 厨余垃圾
  kitchen_waste_collectors: { // 投放收集容器(个)
    type: Object,
  },
  kitchen_waste_positons: { // 单位暂时存放点(处)
    type: Object,
  },
  // 可回收物
  recyclable_waste_collectors: { // 投放收集容器(个)
    type: Object,
  },
  recyclable_waste_positons: { // 单位暂时存放点(处)
    type: Object,
  },
  // 有害垃圾
  harmful_waste_collectors: { // 投放收集容器(个)
    type: Object,
  },
  harmful_waste_positons: { // 单位暂时存放点(处)
    type: Object,
  },
  // 其他垃圾
  other_waste_collectors: { // 投放收集容器(个)
    type: Object,
  },
  other_waste_positons: { // 单位暂时存放点(处)
    type: Object,
  },
  // 医疗垃圾
  medic_waste_collectors: { // 投放收集容器(个)
    type: Object,
  },
  medic_waste_positons: { // 单位暂时存放点(处)
    type: Object,
  },
  // 大件垃圾
  bulky_waste_positons: { // 单位暂时存放点(处)
    type: Object,
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
  other_waste: { // 其他垃圾(公斤)
    type: Object,
  },
  medic_waste: { // 医疗废物(公斤)
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

DomesticGarbageWeeklySummarySchema.index({ time: 1 });

module.exports = mongoose.model('domestic_garbage_weekly_summary', DomesticGarbageWeeklySummarySchema);
