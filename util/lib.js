let axios = require('axios');
let appendQuery = require('append-query');
let _ = require('lodash');

let domesticDaily = require("../models/DomesticGarbageDaily");
let domesticMonthly = require("../models/DomesticGarbageMonthly");
let domesticWeekly = require("../models/DomesticGarbageWeekly");
let medicMonthly = require("../models/MedicGarbageMonthly");

let DomesticGarbageDailySummary = require('../models/DomesticGarbageDailySummary');
let DomesticGarbageWeeklySummary = require('../models/DomesticGarbageWeeklySummary');
let DomesticGarbageMonthlySummary = require('../models/DomesticGarbageMonthlySummary');
let MedicGarbageMonthlySummary = require('../models/MedicGarbageMonthlySummary');

exports.sendSms = async function (phone, code) {
    try {
        let content = `#code#=${code}&#app#=海卫后勤`
        let sendurl = appendQuery('http://v.juhe.cn/sms/send', {
            key: 'ccef2ee30337d1f97f06110cedfd232d',
            mobile: phone,
            tpl_id: 42378,
            tpl_value: content
        });
        let result = await axios(sendurl)
        return result.data && result.data.error_code === 0;
    } catch (e) {
        console.log(e);
        return false;
    }
}

exports.isPhoneNum = function (content) {
    let myreg = /^[1][0-9]{10}$/;
    if (!myreg.test(content)) {
        return false;
    } else {
        return true;
    }
}

exports.summaryDomDaily = async function(time){
    let data = await domesticDaily.find({time});
    let meeting_times = 0,
        self_inspection_times = 0,
        self_inspection_problems = 0,
        advertise_times = 0,
        traning_times = 0,
        trainees = 0,
        gov_inspection_times = 0,
        gov_inspection_problems = 0,
        report_count = 0;
    _.each(data,e =>{
        meeting_times += e.meeting_times;
        self_inspection_times += e.self_inspection_times;
        self_inspection_problems += e.self_inspection_problems;
        advertise_times += e.advertise_times;
        traning_times += e.traning_times;
        trainees += e.trainees;
        gov_inspection_times += e.gov_inspection_times;
        gov_inspection_problems += e.gov_inspection_problems;
        report_count ++;
    });
    
    await (new DomesticGarbageDailySummary({
        time,
        meeting_times,
        self_inspection_times,
        self_inspection_problems,
        advertise_times,
        traning_times,
        trainees,
        gov_inspection_times,
        gov_inspection_problems,
        report_count,
        is_expired: false
    })).save();
    
    return {
        meeting_times,
        self_inspection_times,
        self_inspection_problems,
        advertise_times,
        traning_times,
        trainees,
        gov_inspection_times,
        gov_inspection_problems,
        report_count,
    }
}
