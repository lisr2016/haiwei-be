let axios = require('axios');
let appendQuery = require('append-query');
let _ = require('lodash');
let dayjs = require('dayjs');
let config = require('../config');
let COS = require('cos-nodejs-sdk-v5');
let { MEDIC_LEVEL } = require('../util/CONST')

let domesticDaily = require("../models/DomesticGarbageDaily");
let Organization = require("../models/Organization");
let domesticMonthly = require("../models/DomesticGarbageMonthly");
let domesticWeekly = require("../models/DomesticGarbageWeekly");
let medicMonthly = require("../models/MedicGarbageMonthly");
let barrelDutyMonthly = require("../models/BarrelDutyMonthly");

let DomesticGarbageDailySummary = require('../models/DomesticGarbageDailySummary');
let DomesticGarbageWeeklySummary = require('../models/DomesticGarbageWeeklySummary');
let DomesticGarbageMonthlySummary = require('../models/DomesticGarbageMonthlySummary');
let MedicGarbageMonthlySummary = require('../models/MedicGarbageMonthlySummary');
let BarrelDutyMonthlySummary = require('../models/BarrelDutyMonthlySummary');

exports.formatTime = function (time,format) {
    return dayjs(new Date(time)).format(format || 'YYYY-MM-DD HH:mm');
};

exports.verifyCodeSms = async function (phone, code, content) {
    try {
        let sendurl = appendQuery('http://v.juhe.cn/sms/send', {
            key: 'ccef2ee30337d1f97f06110cedfd232d',
            mobile: phone,
            tpl_id: 42378,
            tpl_value: content ||`#code#=${code}&#app#=海卫后勤`
        });
        let result = await axios(sendurl);
        return result.data && result.data.error_code === 0;
    } catch (e) {
        console.log(e);
        return false;
    }
};

exports.smsDomWeek = async function (phone) {
    try {
        let sendurl = appendQuery('http://v.juhe.cn/sms/send', {
            key: 'ccef2ee30337d1f97f06110cedfd232d',
            mobile: phone,
            tpl_id: 226264
        });
        let result = await axios(sendurl);
        return result.data && result.data.error_code === 0;
    } catch (e) {
        console.log(e);
        return false;
    }
};

exports.smsBarrel = async function (phone) {
    try {
        let sendurl = appendQuery('http://v.juhe.cn/sms/send', {
            key: 'ccef2ee30337d1f97f06110cedfd232d',
            mobile: phone,
            tpl_id: 226587
        });
        let result = await axios(sendurl);
        return result.data && result.data.error_code === 0;
    } catch (e) {
        console.log(e);
        return false;
    }
};

exports.isPhoneNum = function (content) {
    let myreg = /^[1][0-9]{10}$/;
    return myreg.test(content);
};

exports.isTelePhoneNum = function (content) {
    let myreg = /0\d{2,3}-\d{7,8}/;
    return myreg.test(content);
};

exports.summaryDomDaily = async function(time){
    let data = await domesticDaily.find({time});
    let meeting_times = {},
        self_inspection_times = {},
        self_inspection_problems = {},
        advertise_times = {},
        traning_times = {},
        trainees = {},
        gov_inspection_times = {},
        gov_inspection_problems = {},
        report_count = {};
    _.each(Object.keys(MEDIC_LEVEL), e =>{
        meeting_times[e] = 0;
        self_inspection_times[e] = 0;
        self_inspection_problems[e] = 0;
        advertise_times[e] = 0;
        traning_times[e] = 0;
        trainees[e] = 0;
        gov_inspection_times[e] = 0;
        gov_inspection_problems[e] = 0;
        report_count[e] = 0;
    });
    _.each(data,e =>{
        let level = e.level || '6';
        meeting_times[level] += e.meeting_times;
        self_inspection_times [level] += e.self_inspection_times;
        self_inspection_problems [level] += e.self_inspection_problems;
        advertise_times [level] += e.advertise_times;
        traning_times [level] += e.traning_times;
        trainees [level] += e.trainees;
        gov_inspection_times [level] += e.gov_inspection_times;
        gov_inspection_problems [level] += e.gov_inspection_problems;
        report_count[level] ++;
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
};

exports.summaryDomWeekly = async function(time){
    let data = await domesticWeekly.find({time});
   
    let consignee = {},
        guide = {},
        inspector = {},
        kitchen_waste_collectors = {},
        kitchen_waste_positons = {},
        recyclable_waste_collectors = {},
        recyclable_waste_positons = {},
        harmful_waste_collectors = {},
        harmful_waste_positons = {},
        other_waste_collectors = {},
        other_waste_positons = {},
        medic_waste_collectors = {},
        medic_waste_positons = {},
        bulky_waste_positons = {},
        kitchen_waste = {},
        recyclable_waste = {},
        harmful_waste = {},
        other_waste = {},
        medic_waste = {},
        report_count = {};
    _.each(Object.keys(MEDIC_LEVEL), e =>{
        consignee[e] = 0;
        guide[e] = 0;
        inspector[e] = 0;
        kitchen_waste_collectors[e] = 0;
        kitchen_waste_positons[e] = 0;
        recyclable_waste_collectors[e] = 0;
        recyclable_waste_positons[e] = 0;
        harmful_waste_collectors[e] = 0;
        harmful_waste_positons[e] = 0;
        other_waste_collectors[e] = 0;
        other_waste_positons[e] = 0;
        medic_waste_collectors[e] = 0;
        medic_waste_positons[e] = 0;
        bulky_waste_positons[e] = 0;
        kitchen_waste[e] = 0;
        recyclable_waste[e] = 0;
        harmful_waste[e] = 0;
        other_waste[e] = 0;
        medic_waste[e] = 0;
        report_count[e] = 0;
    });
    _.each(data,e =>{
        let level =  e.level || '6';
        consignee [level] += e.consignee;
        guide [level] += e.guide;
        inspector [level] += e.inspector;
        kitchen_waste_collectors [level] += e.kitchen_waste_collectors;
        kitchen_waste_positons [level] += e.kitchen_waste_positons;
        recyclable_waste_collectors [level] += e.recyclable_waste_collectors;
        recyclable_waste_positons [level] += e.recyclable_waste_positons;
        harmful_waste_collectors [level] += e.harmful_waste_collectors;
        harmful_waste_positons [level] += e.harmful_waste_positons;
        other_waste_collectors [level] += e.other_waste_collectors;
        other_waste_positons [level] += e.other_waste_positons;
        medic_waste_collectors [level] += e.medic_waste_collectors;
        medic_waste_positons [level] += e.medic_waste_positons;
        bulky_waste_positons [level] += e.bulky_waste_positons;
        kitchen_waste [level] += e.kitchen_waste;
        recyclable_waste [level] += e.recyclable_waste;
        harmful_waste [level] += e.harmful_waste;
        other_waste [level] += e.other_waste;
        medic_waste [level] += e.medic_waste;
        report_count[level] ++;
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
};

exports.summaryDomMonthly = async function(time){
    let data = await domesticMonthly.find({time});
    let kitchen_waste = {},
        recyclable_waste = {},
        harmful_waste = {},
        bulky_waste = {},
        other_waste = {},
        report_count = {};
    _.each(Object.keys(MEDIC_LEVEL), e =>{
        kitchen_waste[e] = 0;
        recyclable_waste[e] = 0;
        harmful_waste[e] = 0;
        bulky_waste[e] = 0;
        other_waste[e] = 0;
        report_count[e] = 0;
    });
    _.each(data,e =>{
        let level =  e.level || '6';
        kitchen_waste [level] += e.kitchen_waste;
        recyclable_waste [level] += e.recyclable_waste;
        harmful_waste [level] += e.harmful_waste;
        bulky_waste [level] += e.bulky_waste;
        other_waste [level] += e.other_waste;
        report_count[level] ++;
    });
    let result = {
        kitchen_waste, recyclable_waste, harmful_waste, bulky_waste, other_waste, report_count
    };
    let updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await DomesticGarbageMonthlySummary.updateOne({time}, updateInfo, {upsert: true});
    return result;
};

exports.summaryMedMonthly = async function(time){
    let data = await medicMonthly.find({time});
    let total_weight = {},
        report_count = {};
    _.each(Object.keys(MEDIC_LEVEL), e =>{
        total_weight[e] = 0;
        report_count[e] = 0;
    });
    _.each(data,e =>{
        let level = e.level;
        total_weight [level] += e.total_weight;
        report_count[level] ++;
    });
    let result = {
        total_weight,
        report_count
    };
    console.log(result)
    let updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await MedicGarbageMonthlySummary.updateOne({time}, updateInfo, {upsert: true});
    return result
};

exports.summaryBarrelMonthly = async function(time){
    let data = await barrelDutyMonthly.find({time});
    let orgids = _.map(data, i => i.organization_id)
    let orgs = await Organization.find({_id:{$in: orgids}});
    let person_count_on_duty = {},
        report_count = {};
    _.each(Object.keys(MEDIC_LEVEL), e =>{
        person_count_on_duty[e] = 0;
        report_count[e] = 0;
    });
    _.each(data,e =>{
        let level = e.level;
        person_count_on_duty [level] += e.person_count_on_duty;
        report_count[level] ++;
    });
    let result = {
        person_count_on_duty, report_count
    };
    let updateInfo = Object.assign(result, {
        time,
        is_expired: false
    });
    await BarrelDutyMonthlySummary.updateOne({time}, updateInfo, {upsert: true});
    return result
};

exports.calWeeks = function(startTime, endTime){
    while (dayjs(startTime).day() !== 1) {
        startTime = dayjs(startTime).add(-1, 'day');
    }
    startTime = dayjs(startTime).startOf('day');
    let timestamps = [],
        weeks = [];
    while(dayjs(endTime).isAfter(startTime)){
        timestamps.push(startTime.toDate().getTime());
        weeks.push(dayjs(startTime).add(6, 'day').format('YYYY-MM-DD'));
        startTime = dayjs(startTime).add(7, 'day');
    }
    return {timestamps, weeks}
};

exports.calMonths = function(startTime, endTime){
    let timestamps = [],
        months = [];
    while(dayjs(endTime).add(1, 'month').isAfter(startTime)){
        timestamps.push(dayjs(startTime).startOf('month').toDate().getTime());
        months.push(dayjs().year() === dayjs(startTime).year() ? `${dayjs(startTime).month() + 1}月`:`${dayjs(startTime).year()}年${dayjs(startTime).month() + 1}月`)
        startTime = dayjs(startTime).add(1, 'month');
    }
    return {timestamps, months}
};

exports.calMonths = function(startTime, endTime){
    let timestamps = [],
        months = [];
    while(dayjs(endTime).add(1, 'month').isAfter(startTime)){
        timestamps.push(dayjs(startTime).startOf('month').toDate().getTime());
        months.push(dayjs().year() === dayjs(startTime).year() ? `${dayjs(startTime).month() + 1}月`:`${dayjs(startTime).year()}年${dayjs(startTime).month() + 1}月`)
        startTime = dayjs(startTime).add(1, 'month');
    }
    return {timestamps, months}
};

const cos = new COS({
    // 必选参数
    SecretId: config.CosSecretId,
    SecretKey: config.CosSecretKey,
});

exports.cosPutObject = async function (Key, Body) {
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: config.CosBucket,
            Key: Key,
            Body: Body,
            Region: config.CosRegion
        }, function (err, data) {
            if (err) return reject(err);
            return resolve(data);
        });
    })
};

exports.cosGetObjectUrl = async function (Key) {
        return new Promise((resolve, reject) => {
            cos.getObjectUrl({
                Bucket: config.CosBucket,
                Key: Key,
                Region: config.CosRegion,
                Sign: false,
            }, function (err, data) {
                if (err) return reject(err);
                return resolve(data);
            });
        })
};
