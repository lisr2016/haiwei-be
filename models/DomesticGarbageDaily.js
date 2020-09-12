var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 量化填报
var ReportSchema = new Schema({
  // 填报人id
  // 机构id
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
  kitchen_waste_collector: { // 收集容器(个)
    type: Number,
    required: true
  },
  kitchen_waste_positon: { // 单位暂时存放点(处)
    type: Number,
    required: true
  },
  recyclable_waste_collector: {
    type: Number,
    required: true
  },
  recyclable_waste_positon: {
    type: Number,
    required: true
  },
  harmful_waste_collector: {
    type: Number,
    required: true
  },
  harmful_waste_positon: {
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
  bulky_waste: { // 大件垃圾(公斤)
    type: Number,
    required: true
  },
  other_waste: { // 其他垃圾(公斤)
    type: Number,
    required: true
  }
}, {timestamps: {create_time: 'created', update_time: 'updated'}});

module.exports = mongoose.model('Report', ReportSchema);
