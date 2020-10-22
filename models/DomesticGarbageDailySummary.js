var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// 生活垃圾日报汇总
var DomesticGarbageDailySummarySchema = new Schema({
    // 填报日期
    time: {
        type: Date,
        unique: true,
        required: true
    },
    // 分类管理工作会议
    meeting_times: { // 管理工作会议次数
        type: Object,
    },
    
    // 自测、巡查
    self_inspection_times: { //  自测、巡查次数
        type: Object,
    },
    self_inspection_problems: { // 存在问题数目
        type: Object,
    },
    
    // 分类宣传
    advertise_times: { //  宣传次数
        type: Object,
    },
    
    // 分类培训
    traning_times: { //  培训次数
        type: Object,
    },
    trainees: { //  培训人数
        type: Object,
    },
    
    // 政府检查
    gov_inspection_times: { //  检查次数
        type: Object,
    },
    gov_inspection_problems: { // 存在问题数目
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

DomesticGarbageDailySummarySchema.index({ time: 1 });

module.exports = mongoose.model('domestic_garbage_daily_summary', DomesticGarbageDailySummarySchema);
