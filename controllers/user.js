let _ = require('lodash');
let lib = require('../util/lib')

let User = require('../models/User');
let Organization = require('../models/Organization');
let SendMessageLog = require('../models/SendMessageLog');
let AssessTask = require('../models/AssessTask');
let Message = require('../models/Message');
const ObjectId = require('mongodb').ObjectId;
const dayjs = require('dayjs');

const {MEDIC_LEVEL} = require('../util/CONST');

const Joi = require('joi');
var bcrypt = require('bcrypt-nodejs');

exports.fetchUserInfo = function (req, res) {
    let user = req.user;
    if (user.type === '4') {
        const orgInfo = {
            name: '任务指派',
            initialized: true,
        };
        res.status(200).send({code: 0, data: {type: user.type, orgInfo}, msg: '查询成功'});
    } else {
        if (!user.organizationId) {
            res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
            return
        }
        Organization.findOne({
            '_id': new ObjectId(user.organizationId)
        }, function (err, org) {
            if (err) throw err;
            if (!org) {
                res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
            } else {
                const orgInfo = {
                    name: org.name,
                    initialized: org.is_initiated,
                    corporationPhone: org.corporation_phone || '',
                    managerPhone: org.manager_phone || '',
                    bednum: org.bednum,
                    address: org.address,
                    level: org.level,
                    street: org.street,
                };
                res.status(200).send({code: 0, data: {type: user.type || '1', orgInfo}, msg: '查询成功'});
            }
        });
    }
};

const initOrgInfoSchema = {
    corporationPhone: Joi.string(),
    managerPhone: Joi.string(),
    bednum: Joi.number().integer(),
    address: Joi.string().required(),
    level: Joi.number().integer().valid(Object.keys(MEDIC_LEVEL)).required(),
    street: Joi.string().required(),
};

exports.initOrgInfo = async function (req, res) {
    const user = req.user;
    try {
        const initOrgInfo = await Joi.validate(req.body, initOrgInfoSchema);
        let orgInfo = await Organization.findById(user.organizationId);
        `if (!orgInfo) {
            res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
            return
        }`
        const updateInfo = {
            is_initiated: true,
            corporation_phone: initOrgInfo.corporationPhone,
            manager_phone: initOrgInfo.managerPhone,
            bednum: initOrgInfo.bednum,
            address: initOrgInfo.address,
            level: initOrgInfo.level,
            street: initOrgInfo.street,
        };
        await Organization.updateOne({_id: ObjectId(user.organizationId)}, updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, msg: '修改失败'});
    }
};

exports.resetPassword = async function (req, res) {
    try {
        if (!req.body.password || !req.body.newPassword) {
            res.status(400).send({code: 5, msg: '缺少参数'});
            return
        }
        User.findOne({
            phone: req.user.phone
        }, function (err, user) {
            if (err) throw err;
            if (!user) {
                res.status(400).send({code: 5, msg: '更改密码失败'});
            } else {
                user.comparePassword(req.body.password, function (err, isMatch) {
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
                                User.updateOne({_id: new ObjectId(user.id)}, {password: hash}, function (err) {
                                    if (err) {
                                        res.status(400).send({code: 5, msg: '更改密码失败'});
                                        return
                                    }
                                    res.status(400).send({code: 5, msg: '更改密码成功'});
                                    
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

exports.genVerifyCode = async function (req, res) {
    try {
        const smsLimit = 60;
        if (!_.isString(req.query.phone)) {
            res.status(400).send({code: 5, msg: '缺少phone参数'});
            return
        }
        let data = await SendMessageLog.findOne({phone: req.query.phone});
        if (data && data.last_sms_time) {
            if (!dayjs().isAfter(dayjs(data.last_sms_time).add(smsLimit, 'second'))) {
                res.status(400).send({code: 5, msg: `${smsLimit}秒内只能发送一次`});
                return
            }
        }
        let verifyCode = '';
        for (let i = 0; i < 4; i++) {
            verifyCode += Math.floor(Math.random() * 10);
        }
        let result = await lib.verifyCodeSms(req.query.phone, verifyCode);
        await SendMessageLog.updateOne({phone: req.query.phone}, {last_sms_time: new Date().getTime()}, {upsert: true});
        if (result) {
            req.session[req.query.phone] = verifyCode;
            res.status(200).send({code: 0, msg: '获取成功'});
            return;
        }
        res.status(400).send({code: 5, msg: '获取失败'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '获取失败'});
    }
};

exports.checkVerifyCode = async function (req, res) {
    const phone = req.query.phone;
    const verifyCode = req.query.verifyCode;
    try {
        if (!verifyCode || !phone) {
            res.status(200).send({code: 5, msg: '校验失败'});
            return
        }
        if (req.session[phone] === verifyCode) {
            res.status(200).send({code: 0, msg: '校验成功'});
            return
        }
        res.status(400).send({code: 5, msg: '校验失败'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '校验失败'});
    }
};

const newAssessTaskSchema = {
    time: Joi.date().required(),
    name: Joi.string().default('监督员分配考核任务'),
    organizationId: Joi.string().required(),
};

exports.newAssessTask = async function (req, res) {
    try {
        let type = req.user.type;
        if(type !== '4'){
            res.status(400).send({code: 5, msg: '无权限分配任务'});
            return
        }
        const params = await Joi.validate(req.body, newAssessTaskSchema);
        const newAssessTask = new AssessTask({
            start_time: params.time,
            end_time: params.time + 86400000,
            name: params.name,
            type: '1',
            target: '监督员分配考核任务',
            assessor_id: params.organizationId
        });
        await newAssessTask.save();
        let orgInfo = await Organization.findOne({_id: params.organizationId});
        let registed_users = orgInfo.registed_users || {};
        let userIds = Object.keys(registed_users);
        for(let userId of userIds){
            const newMessage = new Message({
                user_id:userId,
                title: `自查任务:${params.name}`,
                content: `有一件自查任务指派给了您,请前往"考核评价"模块查看`,
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
