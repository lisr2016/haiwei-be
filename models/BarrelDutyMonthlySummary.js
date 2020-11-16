var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 桶前值守月报汇总
var BarrelDutyMonthlySummarySchema = new Schema({
    // 填报日期
    time: {
        type: Date,
        unique: true,
        required: true
    },
    // 桶前值守人数(人)
    person_count_on_duty: {
        type: Object
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

BarrelDutyMonthlySummarySchema.index({ time: 1 });

module.exports = mongoose.model('barrel_duty_monthly_summary', BarrelDutyMonthlySummarySchema);
