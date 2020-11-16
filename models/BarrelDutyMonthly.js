var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 桶前值守月报
var BarrelDutyMonthlySchema = new Schema({
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
  // 填报机构级别
  level: {
    type: String,
    required: true
  },
  // 填报日期
  time: {
    type: Date,
    required: true
  },
  person_count_on_duty: { // 桶前值守人数(人)
    type: Number,
    required: true
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

BarrelDutyMonthlySchema.index({ time: 1,  organization_id: -1});

module.exports = mongoose.model('barrel_duty_monthly', BarrelDutyMonthlySchema);
