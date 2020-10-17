let _ = require('lodash');
let config = require('../config');
let jwt = require('jsonwebtoken');

let Admin = require('../models/Admin');
let User = require('../models/User');
let lib = require('../util/lib');
let Organization = require('../models/Organization');
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
let ObjectId = require('mongodb').ObjectId;

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
        console.log(orgIds)
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
                res.status(400).send({code: 5, msg: '更新失败'});
                return
            }
            bcrypt.hash(newUserInfo.password, salt, null, function (err, hash) {
                if (err) {
                    res.status(400).send({code: 5, msg: '更新失败'});
                    return
                }
                let updateInfo = {
                    phone: newUserInfo.phone,
                    password: hash,
                    organization_id: newUserInfo.organizationId,
                    is_deleted: false
                };
                User.updateOne({phone: newUserInfo.phone}, updateInfo, {upsert: true}, function (err) {
                    if (err) {
                        res.status(400).send({code: 5, msg: '更新失败'});
                        return
                    }
                    User.findOne({phone: req.body.phone}, function (err, user) {
                        if (err || !user) {
                            res.status(400).send({code: 5, data, msg: '注册失败'});
                            return
                        }
                        res.status(200).send({code: 0, msg: '更新成功'});
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
    delete: Joi.boolean().required(),
};

exports.deleteUser = async function (req, res) {
    try {
        const deleteUserInfo = await Joi.validate(req.body, deleteUserSchema);
        const updateInfo = {
            is_delete: deleteUserInfo.delete,
        };
        await User.updateOne({_id: ObjectId(deleteUserInfo.userId)}, updateInfo);
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

const updateUserInfoSchema = {
    userId: Joi.string().required(),
    password: Joi.string().required()
};

exports.updateUserInfo = async function (req, res) {
    try {
        const updateUserInfo = await Joi.validate(req.body, updateUserInfoSchema);
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

exports.fetchSummaryTotal = async function (req, res) {
    try {
        const count = await Organization.countDocuments({is_deleted: {$ne: true}});
        res.status(200).send({code: 0, data: {count}, msg: '查询成功'});
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
        if (req.body.startTime && !req.body.endTime) {
            let data = await DomesticGarbageDailySummary.findOne({time: req.body.startTime});
            if (!data || data.is_expired) {
                data = await lib.summaryDomDaily(req.body.startTime)
            }
            res.status(200).send({
                code: 0, data: {
                    meetingTimes: data.meeting_times,
                    selfInspectionTimes: data.self_inspection_times,
                    selfInspectionProblems: data.self_inspection_problems,
                    advertiseTimes: data.advertise_times,
                    traningTimes: data.traning_times,
                    trainees: data.trainees,
                    govInspectionTimes: data.gov_inspection_times,
                    govInspectionProblems: data.gov_inspection_problems,
                    reportCount: data.report_count,
                }, msg: '查询成功'
            });
        } else {
        
        }
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
        let data = await DomesticGarbageWeeklySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryDomWeekly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                consignee: data.consignee,
                guide: data.guide,
                inspector: data.inspector,
                kitchenWasteCollectors: data.kitchen_waste_collectors,
                kitchenWastePositons: data.kitchen_waste_positons,
                recyclableWasteCollectors: data.recyclable_waste_collectors,
                recyclableWastePositons: data.recyclable_waste_positons,
                harmfulWasteCollectors: data.harmful_waste_collectors,
                harmfulWastePositons: data.harmful_waste_positons,
                otherWasteCollectors: data.other_waste_collectors,
                otherWastePositons: data.other_waste_positons,
                medicWasteCollectors: data.medic_waste_collectors,
                medicWastePositons: data.medic_waste_positons,
                bulkyWastePositons: data.bulky_waste_positons,
                kitchenWaste: data.kitchen_waste,
                recyclableWaste: data.recyclable_waste,
                harmfulWaste: data.harmful_waste,
                otherWaste: data.other_waste,
                medicWaste: data.medic_waste,
                reportCount: data.report_count,
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
        let data = await DomesticGarbageMonthlySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryDomMonthly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                kitchenWaste: data.kitchen_waste,
                recyclableWaste: data.recyclable_waste,
                harmfulWaste: data.harmful_waste,
                bulkyWaste: data.bulky_waste,
                otherWaste: data.other_waste,
                reportCount: data.report_count
            }, msg: '查询成功'
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
        let data = await MedicGarbageMonthlySummary.findOne({time: req.body.startTime});
        if (!data || data.is_expired) {
            data = await lib.summaryMedMonthly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                totalWeight: data.total_weight,
                reportCount: data.report_count
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
                        kitchenWaste: data.kitchen_waste,
                        recyclableWaste: data.recyclable_waste,
                        harmfulWaste: data.harmful_waste,
                        otherWaste: data.other_waste,
                        medicWaste: data.medic_waste,
                        reportCount: data.report_count,
                    })
                }
                result = {list, weeks: midRst.weeks};
                break;
            case '2': // 年报
                midRst = lib.calMonths(fetchScreenInfo.startTime, fetchScreenInfo.endTime);
                for (let i = 0; i < midRst.timestamps.length; i++) {
                    let data = await DomesticGarbageMonthlySummary.findOne({time: midRst.timestamps[i]});
                    if (!data || data.is_expired) {
                        data = await lib.summaryDomMonthly(midRst.timestamps[i]);
                    }
                    list.push({
                        kitchenWaste: data.kitchen_waste,
                        recyclableWaste: data.recyclable_waste,
                        harmfulWaste: data.harmful_waste,
                        otherWaste: data.other_waste,
                        bulkyWaste: data.bulky_waste,
                        reportCount: data.report_count,
                    });
                    result = {list, months: midRst.months};
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
                createTime: e.createdAt
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
        const url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1602002862040&di=05d3c266d466b513c275a8281c7ed651&imgtype=0&src=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg'
        res.status(200).json({code: 0, data: url, msg: '上传成功'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};


const newPolicySchema = {
    title: Joi.string().required(),
    content: Joi.string().required(),
    url: Joi.string().required(),
    filename: Joi.string().required(),
};

exports.newPolicy = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, newPolicySchema);
        const newNotify = new Policy({
            title: params.title,
            content: params.content,
            admin_id: req.admin.id,
            url: params.url,
            admin_name: req.admin.username,
            filename: params.filename
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
};

exports.updatePolicyInfo = async function (req, res) {
    try {
        const updatePolicyInfo = await Joi.validate(req.body, updatePolicyInfoSchema);
        const updateInfo = {};
        if (updatePolicyInfo.title) updateInfo.title = updatePolicyInfo.title;
        if (updatePolicyInfo.content) updateInfo.content = updatePolicyInfo.content;
        if (updatePolicyInfo.url) updateInfo.url = updatePolicyInfo.url;
        if (updatePolicyInfo.filename) updateInfo.filename = updatePolicyInfo.filename;
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
    isDelete: Joi.boolean().default(false),
};

exports.cancelPolicy = async function (req, res) {
    try {
        const cancelNotifyInfo = await Joi.validate(req.body, cancelPolicySchema);
        const updateInfo = {
            is_deleted: cancelNotifyInfo.isDelete,
        };
        await Policy.updateOne({_id: ObjectId(cancelNotifyInfo.policyId)}, updateInfo);
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
                createTime: e.createdAt
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
                startTime: e.start_time,
                endTime: e.end_time,
                name: e.name,
                target: e.target,
                content: e.template_content,
                assessorOrgName: e.assessee_id && orgInfoMap[e.assessor_id].name,
                assessorId: e.assessor_id,
                assessorDone: e.assessor_done,
                assessorContent: e.assessor_content,
                assesseeOrgName: e.assessee_id && orgInfoMap[e.assessee_id].name,
                assesseeId: e.assessee_id,
                assesseeDone: e.assessee_done,
                assesseeContent: e.assessee_content,
                type: e.type,
                createTime: e.createdAt
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
            target: params.target,
            assessor_id: params.assessorId,
            assessee_id: params.assesseeId,
            assessor_content: params.assessorContent,
            assessee_content: params.assesseeContent || null,
        });
        await newAssessTask.save();
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
    templateId: Joi.string().required(),
};

exports.deleteTask = async function (req, res) {
    try {
        const params = await Joi.validate(req.body, deleteTaskSchema);
        await AssessTask.deleteOne({_id: params.templateId});
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
