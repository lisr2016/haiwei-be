let _ = require('lodash');
let Assess = require('../models/AssessTask');
let Organization = require('../models/Organization');
let Joi = require('joi');

exports.fetchUserAssessList = async function (req, res) {
    let user = req.user;
    try {
        let assesseeList = await Assess.find({assessee_id: user.organizationId});
        let orgIds = _.chain(assesseeList).map(e => e.assessor_id).uniq().value();
        orgIds.push(req.user.organizationId);
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        assesseeList = _.chain(assesseeList).filter(e => !e.assessee_done).map(e => {
            return {
                startTime: e.start_time,
                endTime: e.end_time,
                name: e.name,
                target: e.target,
                content: e.template_content,
                assesseeOrgName: orgInfoMap[e.assessee_id].name,
                assessorOrgName: orgInfoMap[e.assessor_id].name,
                type: '2',
                createTime: e.createdAt
            }
        }).value();
        let assessorList = await Assess.find({assesser_id: user.organizationId});
        
        // let data = _.chain(messageList).filter(e => !e.is_read).map(e => {
        //     return {
        //         id: e._id,
        //         content: e.content,
        //         title: e.title,
        //         type: a[Math.floor(Math.random()*a.length)],
        //         isRead: e.is_read || false,
        //         createTime: e.createdAt
        //     }
        // }).value();
        res.status(200).send({code: 0, data: assesseeList, msg: '查询成功'});
    } catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

const uploadAssessSchema = {
    id: Joi.string().required(),
    type: Joi.string().required(),
    content: Joi.array().required(),
};

exports.uploadAssess = async function (req, res) {
    try {
        const uploadAssessInfo = await Joi.validate(req.body, uploadAssessSchema);
        let updateInfo = {};
        switch (type) {
            case '1':
                updateInfo.assessor_content = uploadAssessInfo.content;
                updateInfo.assessor_done = true;
                break;
            case '2':
                updateInfo.assessee_content = uploadAssessInfo.content;
                updateInfo.assessee_done = true;
                break;
            default:
                res.status(400).send({code: 5, msg: 'type类型错误'});
                return
        }
        await Assess.updateOne({
            _id: uploadAssessInfo.id
        }, updateInfo);
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};
