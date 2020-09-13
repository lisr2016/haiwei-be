var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾月报
var DomesticGarbageMonthlySchema = new Schema({
  // 填报人id
  // 机构id
  // 填报日期
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

module.exports = mongoose.model('DomesticGarbageMonthly', DomesticGarbageMonthlySchema);
