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
    const result = {
        meeting_times,
        self_inspection_times,
        self_inspection_problems,
        advertise_times,
        traning_times,
        trainees,
        gov_inspection_times,
        gov_inspection_problems,
        report_count,
    };
    const updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await DomesticGarbageDailySummary.updateOne({time}, updateInfo, {upsert: true});
    return result;
}

exports.summaryDomWeekly = async function(time){
    let data = await domesticWeekly.find({time});
   
    let consignee = 0,
        guide = 0,
        inspector = 0,
        kitchen_waste_collectors = 0,
        kitchen_waste_positons = 0,
        recyclable_waste_collectors = 0,
        recyclable_waste_positons = 0,
        harmful_waste_collectors = 0,
        harmful_waste_positons = 0,
        other_waste_collectors = 0,
        other_waste_positons = 0,
        medic_waste_collectors = 0,
        medic_waste_positons = 0,
        bulky_waste_positons = 0,
        kitchen_waste = 0,
        recyclable_waste = 0,
        harmful_waste = 0,
        other_waste = 0,
        medic_waste = 0,
        report_count = 0;
    _.each(data,e =>{
        consignee += e.consignee;
        guide += e.guide;
        inspector += e.inspector;
        kitchen_waste_collectors += e.kitchen_waste_collectors;
        kitchen_waste_positons += e.kitchen_waste_positons;
        recyclable_waste_collectors += e.recyclable_waste_collectors;
        recyclable_waste_positons += e.recyclable_waste_positons;
        harmful_waste_collectors += e.harmful_waste_collectors;
        harmful_waste_positons += e.harmful_waste_positons;
        other_waste_collectors += e.other_waste_collectors;
        other_waste_positons += e.other_waste_positons;
        medic_waste_collectors += e.medic_waste_collectors;
        medic_waste_positons += e.medic_waste_positons;
        bulky_waste_positons += e.bulky_waste_positons;
        kitchen_waste += e.kitchen_waste;
        recyclable_waste += e.recyclable_waste;
        harmful_waste += e.harmful_waste;
        other_waste += e.other_waste;
        medic_waste += e.medic_waste;
        report_count ++;
    });
    const result = {
        consignee,
        guide,
        inspector,
        kitchen_waste_collectors,
        kitchen_waste_positons,
        recyclable_waste_collectors,
        recyclable_waste_positons,
        harmful_waste_collectors,
        harmful_waste_positons,
        other_waste_collectors,
        other_waste_positons,
        medic_waste_collectors,
        medic_waste_positons,
        bulky_waste_positons,
        kitchen_waste,
        recyclable_waste,
        harmful_waste,
        other_waste,
        medic_waste,
        report_count,
    };
    let updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await DomesticGarbageWeeklySummary.updateOne({time}, updateInfo, {upsert: true});
    return result
}

exports.summaryDomMonthly = async function(time){
    let data = await medicMonthly.find({time});
    let total_weight = 0,
        report_count = 0;
    _.each(data,e =>{
        total_weight += e.total_weight;
        report_count ++;
    });
    let result = {
        total_weight
    };
    let updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await MedicGarbageMonthlySummary.updateOne({time}, updateInfo, {upsert: true});
    return result
}

exports.summaryMedMonthly = async function(time){
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
