var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 医疗垃圾月报
var MedicGarbageMonthlySchema = new Schema({
  // 填报人id
  // 机构id
  // 填报日期
  // 专兼职人员
}, {timestamps: {create_time: 'created', update_time: 'updated'}});

module.exports = mongoose.model('MedicGarbageMonthly', MedicGarbageMonthlySchema);
