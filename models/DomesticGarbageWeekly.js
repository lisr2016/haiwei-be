var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾周报
var DomesticGarbageWeeklySchema = new Schema({
  // 填报人id
  // 机构id
  // 填报日期
  // 专兼职人员
  consignee: { // 收运人员
    type: Number,
    required: true
  },
  guide: { // 看守引导人员
    type: Number,
    required: true
  },
  inspector: { // 监督检查人员
    type: Number,
    required: true
  },
  // 收集设施设备配置
  // 厨余垃圾
  kitchen_waste_collectors: { // 投放收集容器(个)
    type: Number,
    required: true
  },
  kitchen_waste_positons: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  // 可回收物
  recyclable_waste_collectors: { // 投放收集容器(个)
    type: Number,
    required: true
  },
  recyclable_waste_positons: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  // 有害垃圾
  harmful_waste_collectors: { // 投放收集容器(个)
    type: Number,
    required: true
  },
  harmful_waste_positons: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  // 其他垃圾
  other_waste_collectors: { // 投放收集容器(个)
    type: Number,
    required: true
  },
  other_waste_positons: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  // 医疗垃圾
  medic_waste_collectors: { // 投放收集容器(个)
    type: Number,
    required: true
  },
  medic_waste_positons: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  // 大件垃圾
  bulky_waste_positons: { // 单位暂时存放点(处)
    type: Number,
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
  other_waste: { // 其他垃圾(公斤)
    type: Number,
    required: true
  },
  medic_waste: { // 医疗废物(公斤)
    type: Number,
    required: true
  },
}, {timestamps: {create_time: 'created', update_time: 'updated'}});
module.exports = mongoose.model('DomesticGarbageWeekly', DomesticGarbageWeeklySchema);
