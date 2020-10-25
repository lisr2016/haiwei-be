let _ = require('lodash');
let config = require('../config');
let jwt = require('jsonwebtoken');

let Admin = require('../models/Admin');
let User = require('../models/User');
let lib = require('../util/lib');
let Organization = require('../models/Organization');
let UploadFileLog = require('../models/UploadFileLog');
let Policy = require('../models/Policy');
let AssessTemplate = require('../models/AssessTemplate');
let AssessTask = require('../models/AssessTask');
let DomesticGarbageDaily = require('../models/DomesticGarbageDaily');
let DomesticGarbageWeekly = require('../models/DomesticGarbageWeekly');
let DomesticGarbageMonthly = require('../models/DomesticGarbageMonthly');
let MedicGarbageMonthly = require('../models/MedicGarbageMonthly');
let DomesticGarbageDailySummary = require('../models/DomesticGarbageDailySummary');
let DomesticGarbageWeeklySummary = require('../models/DomesticGarbageWeeklySummary');
let DomesticGarbageMonthlySummary = require('../models/DomesticGarbageMonthlySummary');
let MedicGarbageMonthlySummary = require('../models/MedicGarbageMonthlySummary');
let Message = require("../models/Message");
let { formatTime } = require('../util/lib');
let ObjectId = require('mongodb').ObjectId;
let { MEDIC_LEVEL } = require('../util/CONST')


let { v4: uuidv4 } = require('uuid');

const Joi = require('joi');
const bcrypt = require('bcrypt-nodejs');
const { isPhoneNum } = require('../util/lib');

exports.login = function (req, res) {
    if (!req.body.phone || !req.body.password) {
        res.status(400).send({code: 5, msg: '缺少手机号、密码'});
        return
    }
    Admin.findOne({
        phone: req.body.phone
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.status(400).send({code: 5, msg: '用户名不存在'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    user = user.toJSON();
                    user.jwtime = new Date().getTime();
                    let token = jwt.sign(user, config.cms_secret);
                    res.json({code: 0, data: {token: token}, msg: '登陆成功'});
                } else {
                    res.status(401).send({code: 5, msg: '密码错误'});
                }
            });
        }
    });
};

exports.fetchUserInfo = function (req, res) {
    res.status(200).send({code: 0, data: {user: req.admin}, msg: '查询成功'});
};

const fetchUserListSchema = {
    search: Joi.string(),
    offset: Joi.number().default(1),
    limit: Joi.number().default(50)
};

exports.fetchUserList = async function (req, res) {
    try {
        let list = [];
        const params = await Joi.validate(req.body, fetchUserListSchema);
        let count = 0;
        if (params.search) {
            if (isPhoneNum(params.search)) {
                // 查找@User.phone 精确匹配
                list = await User.find({phone: params.search});
                count = await User.countDocuments({phone: params.search});
            } else {
                // 查找@Organization.name 模糊匹配
                let orgList = await Organization.find({name: new RegExp(params.search)}, '_id');
                if (_.size(orgList) > 0) {
                    list = await User.find({organization_id: {$in: _.map(orgList, i => i._id)}});
                    count = await User.countDocuments({organization_id: {$in: _.map(orgList, i => i._id)}});
                }
            }
            let start = (params.offset - 1) * params.limit;
            let stop = params.offset * params.limit;
            list = _.slice(list, start, stop)
        } else {
            let skip = (params.offset - 1) * params.limit;
            list = await User.find().skip(skip).limit(params.limit);
            count = await User.countDocuments();
        }
        const orgIds = _.uniq(_.map(list, e => e.organization_id));
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        list = _.map(list, e => {
            const orgInfo = orgInfoMap[e.organization_id] || {};
            return {
                id: e._id,
                phone: e.phone,
                isDeleted: e.is_deleted,
                orgInfo: {
                    organizationId: orgInfo._id,
                    name: orgInfo.name,
                    initialized: orgInfo.is_initiated,
                }
            }
        });
        res.status(200).send({code: 0, data: {list, count}, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

const newUserSchema = {
    phone: Joi.string().required(),
    password: Joi.string().required(),
    organizationId: Joi.string().required()
};

exports.newUser = async function (req, res) {
    try {
        const newUserInfo = await Joi.validate(req.body, newUserSchema);
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                res.status(400).send({code: 5, msg: '新增失败'});
                return
            }
            bcrypt.hash(newUserInfo.password, salt, null, function (err, hash) {
                if (err) {
                    res.status(400).send({code: 5, msg: '新增失败'});
                    return
                }
                let updateInfo = {
                    phone: newUserInfo.phone,
                    password: hash,
                    organization_id: newUserInfo.organizationId,
                    is_deleted: false
                };
                User.findOne({phone: req.body.phone}, function (err, user) {
                    if (err) {
                        res.status(400).send({code: 5, msg: '新增失败'});
                        return
                    }
                    if (user) {
                        res.status(400).send({code: 5, msg: '手机号已存在'});
                        return
                    }
                    User.updateOne({phone: newUserInfo.phone}, updateInfo, {upsert: true}, function (err) {
                        if (err) {
                            res.status(400).send({code: 5, msg: '新增失败'});
                            return
                        }
                        User.findOne({phone: req.body.phone}, function (err, user) {
                            if (err || !user) {
                                res.status(400).send({code: 5, msg: '新增失败'});
                                return
                            }
                            Organization.findOne({_id: newUserInfo.organizationId}, function (err, org) {
                                if (err || !org) {
                                    res.status(400).send({code: 5, msg: '新增失败'});
                                    return
                                }
                                const updateInfo = {registed_users: org.registed_users || {}};
                                updateInfo.registed_users[`${user._id}`] = true;
                                Organization.updateOne({_id: newUserInfo.organizationId}, updateInfo, function (err, result) {
                                    if (err || !result) {
                                        res.status(400).send({code: 5, msg: '新增失败'});
                                        return
                                    }
                                    res.status(200).send({code: 0, msg: '新增成功'});
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '注册失败'});
    }
};

const deleteUserSchema = {
    userId: Joi.string().required(),
    isDelete: Joi.boolean().required(),
};

exports.deleteUser = async function (req, res) {
    try {
        const deleteUserInfo = await Joi.validate(req.body, deleteUserSchema);
        const updateInfo = {
            is_deleted: deleteUserInfo.isDelete,
        };
        await User.updateOne({_id: ObjectId(deleteUserInfo.userId)}, updateInfo);
        let userInfo = await User.findOne({_id: deleteUserInfo.userId});
        let orgInfo = await Organization.findOne({_id: userInfo.organization_id});
        let registedUsers = orgInfo.registed_users || {};
        if (deleteUserInfo.isDelete) {
            delete registedUsers[`${deleteUserInfo.userId}`]
        } else {
            registedUsers[`${deleteUserInfo.userId}`] = true;
        }
        let result = await Organization.updateOne({_id: userInfo.organization_id}, { registed_users: registedUsers });
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

exports.resetPassword = async function (req, res) {
    try {
        if (!req.body.password || !req.body.newPassword || !req.body.verifyCode) {
            res.status(400).send({code: 5, msg: '缺少参数'});
            return
        }
        // if (req.session[req.admin && req.admin.phone] !== req.body.verifyCode) {
        //     res.status(200).send({code: 0, msg: '验证码已过期'});
        //     return
        // }
        
        Admin.findOne({
            phone: req.admin.phone
        }, function (err, admin) {
            if (err) throw err;
            if (!admin) {
                res.status(400).send({code: 5, msg: '更改密码失败'});
            } else {
                admin.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        bcrypt.genSalt(10, function (err, salt) {
                            if (err) {
                                res.status(400).send({code: 5, msg: '更改密码失败'});
                                return
                            }
                            bcrypt.hash(req.body.newPassword, salt, null, function (err, hash) {
                                if (err) {
                                    res.status(400).send({code: 5, msg: '更改密码失败'});
                                    return
                                }
                                Admin.updateOne({_id: new ObjectId(req.admin.id)}, {password: hash}, function (err) {
                                    if (err) {
                                        res.status(400).send({code: 5, msg: '更改密码失败'});
                                        return
                                    }
                                    res.status(200).send({code: 5, msg: '更改密码成功'});
                                    
                                })
                            });
                        });
                    } else {
                        res.status(400).send({code: 5, msg: '旧密码错误'});
                    }
                });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '修改失败'});
    }
};

const updateUserPasswordSchema = {
    userId: Joi.string().required(),
    password: Joi.string().required()
};

exports.updateUserPassword = async function (req, res) {
    try {
        const updateUserInfo = await Joi.validate(req.body, updateUserPasswordSchema);
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                res.status(400).send({code: 5, msg: '更新失败'});
                return
            }
            bcrypt.hash(updateUserInfo.password, salt, null, function (err, hash) {
                if (err) {
                    res.status(400).send({code: 5, msg: '更新失败'});
                    return
                }
                User.updateOne({_id: ObjectId(updateUserInfo.userId)}, {password: hash}, function (err) {
                    if (err) {
                        res.status(400).send({code: 5, msg: '更新失败'});
                        return
                    }
                    res.status(200).send({code: 0, msg: '更新成功'});
                })
            });
        });
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '更新失败'});
    }
};

const updateUserOrgSchema = {
    userId: Joi.string().required(),
    organizationId: Joi.string().required()
};

exports.updateUserOrg = async function (req, res) {
    try {
        const updateUserInfo = await Joi.validate(req.body, updateUserOrgSchema);
        await User.updateOne({_id: ObjectId(updateUserInfo.userId)}, {organization_id: updateUserInfo.organizationId});
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '更新失败'});
    }
};

exports.fetchSummaryTotal = async function (req, res) {
    try {
        const orgs = await Organization.find();
        let result = {all: 0};
        _.each(orgs, e => {
            if (!e.is_deleted) {
                result.all++;
                if (!result[e.level]) result[e.level] = 0;
                result[e.level]++
            }
        });
        res.status(200).send({code: 0, data: result, msg: '查询成功'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

exports.fetchDomDailySummary = async function (req, res) {
    try {
        if (!req.body.startTime) {
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let level = 'all';
        if(req.body.level){
            level = req.body.level;
        }
        let data = await DomesticGarbageDailySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryDomDaily(req.body.startTime)
        }
        res.status(200).send({
            code: 0, data: {
                meetingTimes: level === 'all' ? _.sum(_.values(data.meeting_times)) :  data.meeting_times[level] || 0,
                selfInspectionTimes: level === 'all' ? _.sum(_.values(data.self_inspection_times)) :  data.self_inspection_times[level] || 0,
                selfInspectionProblems: level === 'all' ? _.sum(_.values(data.self_inspection_problems)) :  data.self_inspection_problems[level] || 0,
                advertiseTimes: level === 'all' ? _.sum(_.values(data.advertise_times)) :  data.advertise_times[level] || 0,
                traningTimes: level === 'all' ? _.sum(_.values(data.traning_times)) :  data.traning_times[level] || 0,
                trainees: level === 'all' ? _.sum(_.values(data.trainees)) :  data.trainees[level] || 0,
                govInspectionTimes: level === 'all' ? _.sum(_.values(data.gov_inspection_times)) :  data.gov_inspection_times[level] || 0,
                govInspectionProblems: level === 'all' ? _.sum(_.values(data.gov_inspection_problems)) :  data.gov_inspection_problems[level] || 0,
                reportCount: level === 'all' ? _.sum(_.values(data.report_count)) :  data.report_count[level] || 0,
            }, msg: '查询成功'
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.fetchDomWeeklySummary = async function (req, res) {
    try {
        if (!req.body.startTime) {
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let level = 'all';
        if(req.body.level){
            level = req.body.level;
        }
        let data = await DomesticGarbageWeeklySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryDomWeekly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                consignee: level === 'all' ? _.sum(_.values(data.consignee)) : data.consignee[level] || 0,
                guide:  level === 'all' ? _.sum(_.values(data.guide)) : data.guide[level] || 0,
                inspector: level === 'all' ? _.sum(_.values(data.inspector)) : data.inspector[level] || 0,
                kitchenWasteCollectors:  level === 'all' ? _.sum(_.values(data.kitchen_waste_collectors)) : data.kitchen_waste_collectors[level] || 0,
                kitchenWastePositons: level === 'all' ? _.sum(_.values(data.kitchen_waste_positons)) :  data.kitchen_waste_positons[level] || 0,
                recyclableWasteCollectors: level === 'all' ? _.sum(_.values(data.recyclable_waste_collectors)) : data.recyclable_waste_collectors[level] || 0,
                recyclableWastePositons: level === 'all' ? _.sum(_.values(data.recyclable_waste_positons)) : data.recyclable_waste_positons[level] || 0,
                harmfulWasteCollectors: level === 'all' ? _.sum(_.values(data.harmful_waste_collectors)) : data.harmful_waste_collectors[level] || 0,
                harmfulWastePositons: level === 'all' ? _.sum(_.values(data.harmful_waste_positons)) :  data.harmful_waste_positons[level] || 0,
                otherWasteCollectors: level === 'all' ? _.sum(_.values(data.other_waste_collectors)) : data.other_waste_collectors[level] || 0,
                otherWastePositons: level === 'all' ? _.sum(_.values(data.other_waste_positons)) : data.other_waste_positons[level] || 0,
                medicWasteCollectors: level === 'all' ? _.sum(_.values(data.medic_waste_collectors)) : data.medic_waste_collectors[level] || 0,
                medicWastePositons: level === 'all' ? _.sum(_.values(data.medic_waste_positons)) : data.medic_waste_positons[level] || 0,
                bulkyWastePositons: level === 'all' ? _.sum(_.values(data.bulky_waste_positons)) : data.bulky_waste_positons[level] || 0,
                kitchenWaste: level === 'all' ? _.sum(_.values(data.kitchen_waste)) : data.kitchen_waste[level] || 0,
                recyclableWaste: level === 'all' ? _.sum(_.values(data.recyclable_waste)) : data.recyclable_waste[level] || 0,
                harmfulWaste: level === 'all' ? _.sum(_.values(data.harmful_waste)) : data.harmful_waste[level] || 0,
                otherWaste: level === 'all' ? _.sum(_.values(data.other_waste)) : data.other_waste[level] || 0,
                medicWaste: level === 'all' ? _.sum(_.values(data.medic_waste)) : data.medic_waste[level] || 0,
                reportCount: level === 'all' ? _.sum(_.values(data.report_count)) : data.report_count[level] || 0,
            }, msg: '查询成功'
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.fetchDomMonthlySummary = async function (req, res) {
    try {
        if (!req.body.startTime) {
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let level = 'all';
        if(req.body.level){
            level = req.body.level;
        }
        let data = await DomesticGarbageMonthlySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryDomMonthly(req.body.startTime);
        }
        let result = {
            kitchenWaste: level === 'all' ? _.sum(_.values(data.kitchen_waste)) : data.kitchen_waste[level] || 0,
            recyclableWaste: level === 'all' ? _.sum(_.values(data.recyclable_waste)) : data.recyclable_waste[level] || 0,
            harmfulWaste: level === 'all' ? _.sum(_.values(data.harmful_waste)) : data.harmful_waste[level] || 0,
            bulkyWaste: level === 'all' ? _.sum(_.values(data.bulky_waste)) : data.bulky_waste[level] || 0,
            otherWaste: level === 'all' ? _.sum(_.values(data.other_waste)) : data.other_waste[level] || 0,
            reportCount: level === 'all' ? _.sum(_.values(data.report_count)) : data.report_count[level] || 0
        }
        res.status(200).send({
            code: 0, data: result, msg: '查询成功'
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.fetchMedMonthlySummary = async function (req, res) {
    try {
        if (!req.body.startTime) {
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let level = 'all';
        if(req.body.level){
            level = req.body.level;
        }
        let data = await MedicGarbageMonthlySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryMedMonthly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                totalWeight: level === 'all' ? _.sum(_.values(data.total_weight)) : data.total_weight || 0,
                reportCount: level === 'all' ? _.sum(_.values(data.report_count)) : data.report_count || 0
            }, msg: '查询成功'
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

const fetchScreenSchema = {
    type: Joi.string().valid(['1', '2', '3', '4']).required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
};

exports.fetchScreenSummary = async function (req, res) {
    try {
        const fetchScreenInfo = await Joi.validate(req.body, fetchScreenSchema);
        let result = {};
        let list = [];
        let midRst = null;
        switch (fetchScreenInfo.type) {
            case '1': // 月报
                midRst = lib.calWeeks(fetchScreenInfo.startTime, fetchScreenInfo.endTime);
                for (let i = 0; i < midRst.timestamps.length; i++) {
                    let data = await DomesticGarbageWeeklySummary.findOne({time: midRst.timestamps[i]});
                    if (!data || data.is_expired) {
                        data = await lib.summaryDomWeekly(midRst.timestamps[i]);
                    }
                    list.push({
                        kitchenWaste: _.sum(_.values(data.kitchen_waste)),
                        recyclableWaste: _.sum(_.values(data.recyclable_waste)),
                        harmfulWaste: _.sum(_.values(data.harmful_waste)),
                        otherWaste: _.sum(_.values(data.other_waste)),
                        medicWaste: _.sum(_.values(data.medic_waste)),
                        reportCount: _.sum(_.values(data.report_count)),
                    })
                }
                result = {list, segments: midRst.weeks};
                break;
            case '2': // 年报
                midRst = lib.calMonths(fetchScreenInfo.startTime, fetchScreenInfo.endTime);
                for (let i = 0; i < midRst.timestamps.length; i++) {
                    let data = await DomesticGarbageMonthlySummary.findOne({time: midRst.timestamps[i]});
                    if (!data || data.is_expired) {
                        data = await lib.summaryDomMonthly(midRst.timestamps[i]);
                    }
                    list.push({
                        kitchenWaste: _.sum(_.values(data.kitchen_waste)),
                        recyclableWaste: _.sum(_.values(data.recyclable_waste)),
                        harmfulWaste: _.sum(_.values(data.harmful_waste)),
                        otherWaste: _.sum(_.values(data.other_waste)),
                        bulkyWaste: _.sum(_.values(data.bulky_waste)),
                        reportCount: _.sum(_.values(data.kitchen_waste)),
                    });
                    result = {list, segments: midRst.months};
                }
                break;
            default:
        }
        res.status(200).send({code: 0, data: result, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

exports.signup = function (req, res) {
    if (!req.body.phone || !req.body.password || !req.body.username) {
        res.json({success: false, msg: 'Please pass phone,password,username .'});
    } else {
        let newAdmin = new Admin({
            username: req.body.username,
            phone: req.body.phone,
            password: req.body.password,
            authority: 3
        });
        newAdmin.save(function (err) {
            console.log(err);
            if (err) {
                return res.json({success: false, msg: 'phone already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
};

const fetchOrgListSchema = {
    search: Joi.string(),
    offset: Joi.number().default(1),
    limit: Joi.number().default(50)
}

exports.fetchOrgList = async function (req, res) {
    try {
        let list = [];
        const params = await Joi.validate(req.body, fetchOrgListSchema);
        let count = 0;
        if (params.search) {
            list = await Organization.find({name: new RegExp(params.search)});
            count = await Organization.countDocuments({name: new RegExp(params.search)});
            let start = (params.offset - 1) * params.limit;
            let stop = params.offset * params.limit;
            list = _.slice(list, start, stop)
        } else {
            let skip = (params.offset - 1) * params.limit;
            list = await Organization.find().skip(skip).limit(params.limit).sort({is_deleted: 1});
            count = await Organization.countDocuments();
        }
        list = _.map(list, e => {
            return {
                organizationId: e._id,
                name: e.name,
                initialized: e.initialized,
                corporationPhone: e.corporation_phone,
                managerPhone: e.manager_phone,
                bednum: e.bednum,
                address: e.address,
                level: e.level,
                street: e.street,
                isDeleted: e.is_deleted,
            }
        });
        res.status(200).send({code: 0, data: {list, count}, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

const newOrgSchema = {
    name: Joi.string().required(),
    managerPhone: Joi.string().required(),
    corporationPhone: Joi.string(),
    bednum: Joi.string(),
    address: Joi.string().required(),
    level: Joi.string().required(),
    street: Joi.string().required(),
};

exports.newOrg = async function (req, res) {
    try {
        const newOrgInfo = await Joi.validate(req.body, newOrgSchema);
        let orgInfo = await Organization.findOne({name: newOrgInfo.name});
        if (orgInfo) {
            res.status(200).send({code: 1, msg: '该机构名称已存在'});
            return
        } else {
            let newOrganization = new Organization({
                name: newOrgInfo.name,
                manager_phone: newOrgInfo.managerPhone,
                corporation_phone: newOrgInfo.corporationPhone,
                bednum: newOrgInfo.bednum,
                address: newOrgInfo.address,
                level: newOrgInfo.level,
                street: newOrgInfo.street,
            });
            await newOrganization.save();
        }
        res.status(200).send({code: 0, msg: '添加成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '添加失败'});
    }
};

const updateOrgInfoSchema = {
    organizationId: Joi.string().required(),
    corporationPhone: Joi.string(),
    managerPhone: Joi.string(),
    bednum: Joi.number().integer(),
    address: Joi.string(),
    level: Joi.string(),
    street: Joi.string()
};

exports.updateOrgInfo = async function (req, res) {
    try {
        const initOrgInfo = await Joi.validate(req.body, updateOrgInfoSchema);
        const updateInfo = {
            corporation_phone: initOrgInfo.corporationPhone,
            manager_phone: initOrgInfo.managerPhone,
            bednum: initOrgInfo.bednum,
            address: initOrgInfo.address,
            level: initOrgInfo.level,
            street: initOrgInfo.street,
        }
        await Organization.updateOne({_id: ObjectId(initOrgInfo.organizationId)}, updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

const deleteOrgSchema = {
    organizationId: Joi.string().required(),
    isDelete: Joi.boolean().default(false),
};

exports.deleteOrg = async function (req, res) {
    try {
        const deleteOrgInfo = await Joi.validate(req.body, deleteOrgSchema);
        const updateInfo = {
            is_deleted: deleteOrgInfo.isDelete,
        }
        await Organization.updateOne({_id: ObjectId(deleteOrgInfo.organizationId)}, updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};


const fetchPolicyListSchema = {
    offset: Joi.number().default(1),
    limit: Joi.number().default(50)
};

exports.fetchPolicyList = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, fetchPolicyListSchema);
        let skip = (params.offset - 1) * params.limit;
        let list = await Policy.find().skip(skip).limit(params.limit).sort({is_deleted: 1});
        list = _.map(list, e => {
            return {
                id: e._id,
                title: e.title,
                content: e.content,
                isDeleted: e.is_deleted,
                publisher: e.admin_name,
                url: e.url,
                filename: e.filename,
                levels: e.levels,
                createTime: formatTime(e.createdAt && e.createdAt.getTime())
            }
        });
        let count = await Policy.countDocuments();
        res.status(200).send({code: 0, data: {list, count}, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

exports.uploadFile = async function (req, res) {
    try {
        if (!_.size(req.file)) {
            res.status(400).json({code: 5, msg: '未发现上传文件'});
            return;
        }
        if (!req.body.filename) {
            res.status(400).json({code: 5, msg: '缺少filename参数'});
            return;
        }
        let size = req.file.size;
        if (_.last(req.file.originalname.split('.')) !== _.last(req.body.filename.split('.'))) {
            res.status(200).json({code: 5, msg: 'filename 文件类型和上传文件不匹配'});
            return;
        }
        const suffixFilter = ['doc', 'docx', 'xls', 'xlsx', 'pdf'];
        if (!_.includes(suffixFilter, _.last(req.file.originalname.split('.')))) {
            res.status(200).json({ code: 5, msg: '文件类型错误，请上传 word、excel 或者 pdf 文件' });
            return;
        }
        let key = `policy/${uuidv4()}/${req.body.filename}`;
        let buffer = req.file.buffer;
        let result = await lib.cosPutObject(key, buffer);
        if(result.statusCode === 200) {
            const newUploadFileLog = new UploadFileLog({
                uploader: 'admin',
                is_success: true,
                size: size,
                key: key,
            });
            await newUploadFileLog.save();
            let result = await lib.cosGetObjectUrl(key);
            res.status(200).json({code: 0, data: result.Url, msg: '上传成功'});
            return
        }
        const newUploadFileLog = new UploadFileLog({
            uploader: 'admin',
            is_success: false,
            size: size,
            key: key,
        });
        await newUploadFileLog.save();
        res.status(500).json({code: 0, msg: '上传失败'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '上传失败'});
    }
};

const newPolicySchema = {
    title: Joi.string().required(),
    content: Joi.string().required(),
    url: Joi.string().required(),
    filename: Joi.string().required(),
    levels: Joi.array()
};

exports.newPolicy = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, newPolicySchema);
        if(_.size(params.levels) === _.size(MEDIC_LEVEL)) params.levels = null;
        const newNotify = new Policy({
            title: params.title,
            content: params.content,
            admin_id: req.admin.id,
            url: params.url,
            admin_name: req.admin.username,
            filename: params.filename,
            levels: params.levels
        });
        await newNotify.save();
        res.status(200).send({code: 0, msg: '添加成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '添加失败'});
    }
};

const updatePolicyInfoSchema = {
    policyId: Joi.string().required(),
    title: Joi.string(),
    content: Joi.string(),
    url: Joi.string().required(),
    filename: Joi.string().required(),
    levels:Joi.array(),
};

exports.updatePolicyInfo = async function (req, res) {
    try {
        const updatePolicyInfo = await Joi.validate(req.body, updatePolicyInfoSchema);
        const updateInfo = {};
        if(_.size(updatePolicyInfo.levels) === _.size(MEDIC_LEVEL)) updatePolicyInfo.levels = null;
        if (updatePolicyInfo.title) updateInfo.title = updatePolicyInfo.title;
        if (updatePolicyInfo.content) updateInfo.content = updatePolicyInfo.content;
        if (updatePolicyInfo.url) updateInfo.url = updatePolicyInfo.url;
        if (updatePolicyInfo.filename) updateInfo.filename = updatePolicyInfo.filename;
        if (_.size(updatePolicyInfo.levels)) updateInfo.levels = updatePolicyInfo.levels;
        await Policy.updateOne({_id: ObjectId(updatePolicyInfo.policyId)}, updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

const cancelPolicySchema = {
    policyId: Joi.string().required(),
};

exports.cancelPolicy = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, cancelPolicySchema);
        await Policy.deleteOne({_id: params.policyId});
        res.status(200).send({code: 0, msg: '删除成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

const newAssessTemplateSchema = {
    name: Joi.string().required(),
    content: Joi.array().required(),
};

exports.newAssessTemplate = async function (req, res) {
    try {
        const newAssessTemplateInfo = await Joi.validate(req.body, newAssessTemplateSchema);
        const newAssessTemplate = new AssessTemplate({
            name: newAssessTemplateInfo.name,
            content: newAssessTemplateInfo.content,
        });
        await newAssessTemplate.save();
        res.status(200).send({code: 0, msg: '添加成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '添加失败'});
    }
};

const updateAssessTemplateSchema = {
    templateId: Joi.string().required(),
    name: Joi.string(),
    content: Joi.array(),
};

exports.updateAssessTemplate = async function (req, res) {
    try {
        const updateAssessTemplateInfo = await Joi.validate(req.body, updateAssessTemplateSchema);
        const updateInfo = {};
        if (_.size(updateAssessTemplateInfo.name) > 0) {
            updateInfo.name = updateAssessTemplateInfo.name;
        }
        if (_.size(updateAssessTemplateInfo.content) > 0) {
            updateInfo.content = updateAssessTemplateInfo.content;
        }
        await AssessTemplate.updateOne({_id: ObjectId(updateAssessTemplateInfo.templateId)}, updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

const fetchAssessTemplateListSchema = {
    offset: Joi.number().default(1),
    limit: Joi.number().default(50)
};

exports.fetchAssessTemplateList = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, fetchAssessTemplateListSchema);
        const skip = (params.offset - 1) * params.limit;
        const data = await AssessTemplate.find().skip(skip).limit(params.limit);
        let list = _.map(data, e => {
            return {
                id: e._id,
                name: e.name,
                content: e.content,
                createTime: formatTime(e.createdAt && e.createdAt.getTime())
            }
        });
        let count = await AssessTemplate.countDocuments();
        res.status(200).send({code: 0, data: {list, count}, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

const fetchAssessTaskListSchema = {
    offset: Joi.number().default(1),
    limit: Joi.number().default(50)
};

exports.fetchAssessTaskList = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, fetchAssessTaskListSchema);
        const skip = (params.offset - 1) * params.limit;
        const data = await AssessTask.find().skip(skip).limit(params.limit);
        let orgIds = _.chain(data).map(e => e.assessor_id).value();
        let orgIds2 = _.chain(data).map(e => e.assessee_id).value();
        orgIds = _.chain(orgIds).concat(orgIds2).uniq().value();
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        let list = _.map(data, e => {
            return {
                id: e._id,
                startTime: formatTime(e.start_time && e.start_time.getTime()),
                endTime: formatTime(e.end_time && e.end_time.getTime()),
                name: e.name,
                target: e.target,
                content: e.template_content,
                assessorOrgName: e.assessor_id && orgInfoMap[e.assessor_id].name,
                assessorId: e.assessor_id,
                assessorDone: e.assessor_done,
                assessorContent: e.assessor_content,
                assesseeOrgName: e.assessee_id && orgInfoMap[e.assessee_id].name,
                assesseeId: e.assessee_id,
                assesseeDone: e.assessee_done,
                assesseeContent: e.assessee_content,
                type: e.type,
                createTime: formatTime(e.createdAt && e.createdAt.getTime())
            }
        });
        let count = await AssessTask.countDocuments();
        res.status(200).send({code: 0, data: {list, count}, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

const newAssessTaskSchema = {
    templateId: Joi.string().required(),
    type: Joi.string().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    name: Joi.string().required(),
    target: Joi.string().required(),
    assessorId: Joi.string().required(),
    assesseeId: Joi.string(),
};

exports.newAssessTask = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, newAssessTaskSchema);
        const template = await AssessTemplate.findOne({_id: params.templateId});
        if (!template) {
            res.status(400).send({code: 5, msg: '模板id错误'});
            return
        }
        const newAssessTask = new AssessTask({
            template_id: params.templateId,
            start_time: params.startTime,
            end_time: params.endTime,
            template_content: template.content,
            name: params.name,
            type: params.type,
            target: params.target,
            assessor_id: params.assessorId,
            assessee_id: params.assesseeId,
            assessor_content: params.assessorContent,
            assessee_content: params.assesseeContent || null,
        });
        await newAssessTask.save();
        if (params.assesseeId && params.type === '2') { // 互查情况下给机构assesseeId下的用户发送提醒信息
            let orgInfo = await Organization.findOne({_id: params.assesseeId});
            let registed_users = orgInfo.registed_users || {};
            let userIds = Object.keys(registed_users);
            for(let userId of userIds){
                const newMessage = new Message({
                    user_id:userId,
                    title: `互查任务:${params.name}`,
                    content: `有一件互查任务指派给了您,请前往"考核验证"模块查看`,
                    type: '1'
                });
                await newMessage.save();
            }
        }
        let orgInfo = await Organization.findOne({_id: params.assessorId});
        let registed_users = orgInfo.registed_users || {};
        let userIds = Object.keys(registed_users);
        for(let userId of userIds){
            const newMessage = new Message({
                user_id:userId,
                title: `自查任务:${params.name}`,
                content: `有一件自查任务指派给了您,请前往"考核验证"模块查看`,
                type: '1'
            });
            await newMessage.save();
        }
        res.status(200).send({code: 0, msg: '添加成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '添加失败'});
    }
};

const deleteTaskSchema = {
    taskId: Joi.string().required(),
};

exports.deleteTask = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, deleteTaskSchema);
        await AssessTask.deleteOne({_id: params.taskId});
        res.status(200).send({code: 0, msg: '删除成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '删除失败'});
    }
};

const fetchReportListSchema = {
    offset: Joi.number().default(1),
    limit: Joi.number().default(50),
    orgId: Joi.string().required(),
    time: Joi.date(),
    reportType: Joi.string().required(),
};

exports.fetchReportList = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, fetchReportListSchema);
        let list = [];
        let options = {organization_id: params.organizationId};
        if(params.time){
            options.time = params.time;
        }
        let skip = (params.offset - 1) * params.limit;
        let count = null;
        switch (params.reportType) {
            case '1':
                list = await DomesticGarbageDaily.find(options).skip(skip).limit(params.limit);
                count = await DomesticGarbageDaily.countDocuments(options);
                break;
            case '2':
                list = await DomesticGarbageWeekly.find(options).skip(skip).limit(params.limit);
                count = await DomesticGarbageWeekly.countDocuments(options);
                break;
            case '3':
                list = await DomesticGarbageMonthly.find(options).skip(skip).limit(params.limit);
                count = await DomesticGarbageMonthly.countDocuments(options);
                break;
            case '4':
                list = await MedicGarbageMonthly.find(options).skip(skip).limit(params.limit);
                count = await MedicGarbageMonthly.countDocuments(options);
                break;
            default:
                res.status(400).send({code: 5, msg: 'reportType类型错误'});
                return
        }
        res.status(200).send({code: 0, data: {list, count}, msg: 'reportType类型错误'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};
