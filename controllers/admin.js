let _ = require('lodash');
let config = require('../config');
let jwt = require('jsonwebtoken');

let Admin = require('../models/Admin');
let User = require('../models/User');
let lib = require('../util/lib')
let Organization = require('../models/Organization');
let DomesticGarbageDailySummary = require('../models/DomesticGarbageDailySummary');
let DomesticGarbageWeeklySummary = require('../models/DomesticGarbageWeeklySummary');
let DomesticGarbageMonthlySummary = require('../models/DomesticGarbageMonthlySummary');
let MedicGarbageMonthlySummary = require('../models/MedicGarbageMonthlySummary');
let ObjectId = require('mongodb').ObjectId;


const Joi = require('joi')
const bcrypt = require('bcrypt-nodejs');
const { isPhoneNum } =require('../util/lib')

exports.login = function(req, res) {
    if (!req.body.phone || !req.body.password) {
        res.status(400).send({code: 5, msg: '缺少手机号、密码'});
        return
    }
    Admin.findOne({
        phone: req.body.phone
    }, function(err, user) {
        if (err) throw err;
        if (!user) {
            res.status(400).send({code: 5, msg: '用户名不存在'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.sign(user.toJSON(), config.cms_secret);
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
}

exports.fetchUserList = async function (req, res) {
    try {
        let list = []
        const params = await Joi.validate(req.body, fetchUserListSchema);
        if (params.search) {
            if (isPhoneNum(params.search)) {
                // 查找@User.phone 精确匹配
                list = await User.find({phone: params.search})
            } else {
                // 查找@Organization.name 模糊匹配
                let orgList = await Organization.find({name: new RegExp(params.search)}, '_id');
                if (_.size(orgList) > 0) {
                    list = await User.find({organization_id: {$in: _.map(orgList, i => i._id)}});
                }
            }
            let start = (params.offset - 1) * params.limit;
            let stop = params.offset * params.limit;
            list = _.slice(list, start, stop)
        }else{
            let skip = (params.offset - 1) * params.limit;
            list = await User.find().skip(skip).limit(params.limit);
        }
        const orgIds = _.uniq(_.map(list, e => e.organization_id));
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        list = _.map(list, e => {
            const orgInfo = orgInfoMap[e.organization_id] || {};
            return {
                id: e._id,
                phone: e.phone,
                orgInfo: {
                    organizationId: orgInfo._id,
                    name: orgInfo.name,
                    initialized: orgInfo.initialized,
                    corporationPhone: orgInfo.corporation_phone,
                    managerPhone: orgInfo.manager_phone,
                    bednum: orgInfo.bednum,
                    address: orgInfo.address,
                    level: orgInfo.level,
                    street: orgInfo.street,
                }
            }
        });
        let count = await User.countDocuments({is_deleted: {$ne: true}});
        res.status(200).send({code: 0, data: { list, count }, msg: '查询成功'});
    } catch (e) {
        let data = '';
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e)
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

const newUserSchema = {
    phone: Joi.string().required(),
    password: Joi.string().required(),
    organizationName: Joi.string().required()
}

exports.newUser = async function (req, res) {
    try {
        const newUserInfo = await Joi.validate(req.body, newUserSchema);
        let orgInfo = await Organization.findOne({name: newUserInfo.organizationName});
        if (!orgInfo) {
            let newOrganization = new Organization({
                name: newUserInfo.organizationName,
                manager_phone : '待完善',
                address: '待完善',
                level: '待完善',
                street: '待完善'
            });
            orgInfo = await newOrganization.save();
        }
        let newUser = new User({
            phone: newUserInfo.phone,
            password: newUserInfo.password,
            organization_id: orgInfo._id
        });
        let result = await newUser.save();
        res.status(200).send({code: 0, msg: '添加成功'});
    } catch (e) {
        if(e.code === 11000) {
            res.status(200).send({code: 1, msg: '该手机号已存在'});
            return
        }
        console.log(e)
        res.status(400).send({code: 5, msg: '添加失败'});
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
        console.log(e)
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
                    res.status(200).send({code: 5, msg: '更新成功'});
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
        console.log(e)
        res.status(400).send({code: 5, data, msg: '更新失败'});
    }
};

const updateOrgInfoSchema = {
    organizationId: Joi.string().required(),
    corporationPhone: Joi.string(),
    managerPhone: Joi.string(),
    bednum:  Joi.number().integer(),
    address: Joi.string(),
    level: Joi.string(),
    street: Joi.string()
}

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
        if(_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e)
        res.status(400).send({code: 5, data, msg: '修改失败'});
    }
};

exports.fetchSummaryTotal = async function (req, res) {
    try {
        const count = await Organization.countDocuments();
        res.status(200).send({code: 0, data: {count}, msg: '查询成功'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, data, msg: '查询失败'});
    }
};

exports.fetchDomDailySummary = async function (req, res) {
    try {
        if(!req.body.startTime){
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let data = await DomesticGarbageDailySummary.findOne({time: req.body.startTime});
        if(!data || data.is_expired){
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
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.fetchDomWeeklySummary = async function (req, res) {
    try {
        if(!req.body.startTime){
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let data = await DomesticGarbageWeeklySummary.findOne({time: req.body.startTime});
        if(!data || data.is_expired){
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
        if(!req.body.startTime){
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        let data = await DomesticGarbageMonthlySummary.findOne({time: req.body.startTime});
        if(!data || data.is_expired){
            data = await lib.summaryDomMonthly(req.body.startTime);
        }
        res.status(200).send({
            code: 0, data: {
                consignee: data.consignee,
            }, msg: '查询成功'
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.fetchMedMonthlySummary = async function (req, res) {
};

exports.fetchScreenSummary = async function (req, res) {
};

exports.signup = function(req, res) {
    if (!req.body.phone || !req.body.password ||!req.body.username) {
        res.json({success: false, msg: 'Please pass phone,password,username .'});
    } else {
        let newAdmin = new Admin({
            username: req.body.username,
            phone: req.body.phone,
            password: req.body.password,
            authority: 3
        });
        newAdmin.save(function(err) {
            console.log(err)
            if (err) {
                return res.json({success: false, msg: 'phone already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
};


