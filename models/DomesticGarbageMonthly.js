var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾月报
var DomesticGarbageMonthlySchema = new Schema({
  // 填报人id
  user_id: {
    type: String,
    required: true
  },
  // 机构id
  organization_id: {
    type: String,
    required: true
  },
  // 填报日期
  time: {
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
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

DomesticGarbageMonthlySchema.index({ time: 1,  organization_id: -1});

module.exports = mongoose.model('domestic_garbage_monthly', DomesticGarbageMonthlySchema);
