let _ = require('lodash');

let domesticDaily = require("../models/DomesticGarbageDaily");
let domesticMonthly = require("../models/DomesticGarbageMonthly");
let domesticWeekly = require("../models/DomesticGarbageWeekly");
let medicMonthly = require("../models/MedicGarbageMonthly");

const Joi = require('joi')

const summitDomDailySchema = {
    time: Joi.date().required(),
    
    meetingTimes: Joi.number().integer().required(),
    meetingHost: Joi.string().required(),
    meetingContent: Joi.string().required(),
    
    selfTimes: Joi.number().integer().required(),
    selfProblems: Joi.number().integer().required(),
    selfContent: Joi.string().required(),
    selfCorrected: Joi.boolean().required(),
    
    advertiseTimes: Joi.number().integer().required(),
    advertiseContent: Joi.string().required(),
    
    traningTimes: Joi.number().integer().required(),
    trainees: Joi.number().integer().required(),
    traningContent: Joi.string().required(),
    
    govTimes: Joi.number().integer().required(),
    govProblems: Joi.number().integer().required(),
    govContent: Joi.string().required(),
    govCorrected: Joi.boolean().required(),
}

exports.summitDomDaily = async function (req, res) {
    const user = req.user
    if (!user.organizationId) {
        res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        return
    }
    try {
        const domDailyInfo = await Joi.validate(req.body, summitDomDailySchema);
        let newDomesticDaily = new domesticDaily({
            time: domDailyInfo.time,
            user_id: user.id,
            organization_id: user.organizationId,
            
            meeting_times: domDailyInfo.meetingTimes,
            meeting_host: domDailyInfo.meetingHost,
            meeting_content: domDailyInfo.meetingContent,
            
            self_inspection_times: domDailyInfo.selfTimes,
            self_inspection_problems: domDailyInfo.selfProblems,
            self_inspection_content: domDailyInfo.selfContent,
            self_inspection_corrected: domDailyInfo.selfCorrected,
            
            advertise_times: domDailyInfo.advertiseTimes,
            advertise_content: domDailyInfo.advertiseContent,
            
            traning_times: domDailyInfo.traningTimes,
            trainees: domDailyInfo.trainees,
            traning_content: domDailyInfo.traningContent,
            
            gov_inspection_times: domDailyInfo.govTimes,
            gov_inspection_problems: domDailyInfo.govProblems,
            gov_inspection_content: domDailyInfo.govContent,
            gov_inspection_corrected: domDailyInfo.govCorrected,
        })
        await newDomesticDaily.save();
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};

const summitDomWeeklySchema = {
    time: Joi.date().required(),
    
    consignee: Joi.number().required(),
    guide: Joi.number().required(),
    inspector: Joi.number().required(),
    kitchenWasteCollectors: Joi.number().required(),
    kitchenWastePositions: Joi.number().required(),
    recyclableWasteCollectors: Joi.number().required(),
    recyclableWastePositions: Joi.number().required(),
    harmfulWasteCollectors: Joi.number().required(),
    harmfulWastePositions: Joi.number().required(),
    otherWasteCollectors: Joi.number().required(),
    otherWastePositions: Joi.number().required(),
    medicWasteCollectors: Joi.number().required(),
    medicWastePositions: Joi.number().required(),
    bulkyWastePositions: Joi.number().required(),
    kitchenWaste: Joi.number().required(),
    recyclableWaste: Joi.number().required(),
    harmfulWaste: Joi.number().required(),
    otherWaste: Joi.number().required(),
    medicWaste: Joi.number().required(),
}

exports.summitDomWeekly = async function (req, res) {
    const user = req.user
    if (!user.organizationId) {
        res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        return
    }
    try {
        const domWeeklyInfo = await Joi.validate(req.body, summitDomWeeklySchema);
        let newDomesticWeekly = new domesticWeekly({
            time: domWeeklyInfo.time,
            user_id: user.id,
            organization_id: user.organizationId,
    
            consignee: domWeeklyInfo.consignee,
            guide: domWeeklyInfo.guide,
            inspector: domWeeklyInfo.inspector,
            kitchenWasteCollectors: domWeeklyInfo.kitchen_waste_collectors,
            kitchenWastePositions: domWeeklyInfo.kitchen_waste_positons,
            recyclableWasteCollectors: domWeeklyInfo.recyclable_waste_collectors,
            recyclableWastePositions: domWeeklyInfo.recyclable_waste_positons,
            harmfulWasteCollectors: domWeeklyInfo.harmful_waste_collectors,
            harmfulWastePositions: domWeeklyInfo.harmful_waste_positons,
            otherWasteCollectors: domWeeklyInfo.other_waste_collectors,
            otherWastePositions: domWeeklyInfo.other_waste_positons,
            medicWasteCollectors: domWeeklyInfo.medic_waste_collectors,
            medicWastePositions: domWeeklyInfo.medic_waste_positons,
            bulkyWastePositions: domWeeklyInfo.bulky_waste_positons,
            kitchenWaste: domWeeklyInfo.kitchen_waste,
            recyclableWaste: domWeeklyInfo.recyclable_waste,
            harmfulWaste: domWeeklyInfo.harmful_waste,
            otherWaste: domWeeklyInfo.other_waste,
            medicWaste: domWeeklyInfo.medic_waste,
        })
        await newDomesticWeekly.save();
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};

const summitDomMonthlySchema = {
    time: Joi.number().integer().required(),
    
    kitchenWaste: Joi.number().required(),
    recyclableWaste: Joi.number().required(),
    harmfulWaste: Joi.number().required(),
    bulkyWaste: Joi.number().required(),
    otherWaste: Joi.number().required(),
}

exports.summitDomMonthly = async function (req, res) {
    const user = req.user
    if (!user.organizationId) {
        res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        return
    }
    try {
        const domMonthlyInfo = await Joi.validate(req.body, summitDomMonthlySchema);
        let newDomesticMonthly = new domesticMonthly({
            time: domMonthlyInfo.time,
            user_id: user.id,
            organization_id: user.organizationId,
    
            kitchen_waste: domMonthlyInfo.kitchenWaste,
            recyclable_waste: domMonthlyInfo.recyclableWaste,
            harmful_waste: domMonthlyInfo.harmfulWaste,
            bulky_waste: domMonthlyInfo.bulkyWaste,
            other_waste: domMonthlyInfo.otherWaste,
        })
        await newDomesticMonthly.save();
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};

const summitMedMonthlySchema = {
    time: Joi.number().integer().required(),
    totalWeight: Joi.number().required(),
}

exports.summitMedMonthly = async function (req, res) {
    const user = req.user
    if (!user.organizationId) {
        res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        return
    }
    try {
        const medMonthlyInfo = await Joi.validate(req.body, summitMedMonthlySchema);
        let newMedicMonthly = new medicMonthly({
            time: medMonthlyInfo.time,
            user_id: user.id,
            organization_id: user.organizationId,
            total_weight: medMonthlyInfo.totalWight,
        })
        await newMedicMonthly.save();
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e)
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};

