let _ = require('lodash');
let config = require('../config');

let User = require("../models/User");
let Organization = require("../models/Organization");
const ObjectId = require('mongodb').ObjectId;

const { MEDIC_LEVEL } = require('../util/CONST')

const Joi = require('joi')

exports.fetchUserInfo = function (req, res) {
    let user = req.user
    if (!user.organizationId) {
        res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        return
    }
    Organization.findOne({
        '_id': new ObjectID(user.organizationId)
    }, function (err, org) {
        if (err) throw err;
        if (!org) {
            res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
        } else {
            const orgInfo = {
                name: org.name,
                initialized: org.is_initiated,
                corporationPhone: org.is_initiated,
                managerPhone: org.manager_phone,
                bednum: org.bednum,
                address: org.address,
                level: org.level,
                street: org.street,
            }
            res.status(400).send({code: 0, data: {orgInfo}, msg: '查询成功'});
        }
    });
};

const initOrgInfoSchema = {
    corporationPhone: Joi.string().error(new Error('法人电话格式不正确')),
    managerPhone: Joi.string().required().error(new Error('负责人电话格式不正确')),
    bednum: Joi.number().integer().error(new Error('床位数格式不正确')),
    address: Joi.string().required().error(new Error('地址格式不正确')),
    level: Joi.number().integer().valid(Object.keys(MEDIC_LEVEL)).required().error(new Error('机构级别不正确')),
    street: Joi.string().required().error(new Error('街道信息格式不正确')),
}

exports.initOrgInfo = async function (req, res) {
    const user = req.user
    try {
        const initOrgInfo = await Joi.validate(req.body, initOrgInfoSchema);
        let orgInfo = await Organization.findById(user.organizationId)
        if(!orgInfo) {
            res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
            return
        }
        const updateInfo = {
            corporation_phone: initOrgInfo.corporationPhone,
            manager_phone: initOrgInfo.managerPhone,
            bednum: initOrgInfo.bednum,
            address: initOrgInfo.address,
            level: initOrgInfo.level,
            street: initOrgInfo.street,
        }
        await Organization.updateOne({_id: ObjectId(user.organizationId)},updateInfo);
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '修改失败'});
    }
};

