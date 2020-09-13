var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 医疗垃圾月报
var MedicGarbageMonthlySchema = new Schema({
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
        type: Date,
        required: true
    },
    // 月度医疗垃圾产量(公斤)
    total_weight: {
        type: Number,
        required: true
    },
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('medic_garbage_monthly', MedicGarbageMonthlySchema);
