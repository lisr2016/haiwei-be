var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 医疗垃圾月报汇总
var MedicGarbageMonthlySummarySchema = new Schema({
    // 填报日期
    time: {
        type: Date,
        unique: true,
        required: true
    },
    // 月度医疗垃圾产量(公斤)
    total_weight: {
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

module.exports = mongoose.model('medic_garbage_monthly_summary', MedicGarbageMonthlySummarySchema);
