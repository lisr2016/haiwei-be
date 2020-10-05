let _ = require('lodash');
let Assess = require('../models/AssessTask');
let Organization = require('../models/Organization');

exports.fetchUserAssessList = async function (req, res) {
    let user = req.user;
    try {
        let assesseeList = await Assess.find({assessee_id: user.organizationId});
        let orgIds = _.chain(assesseeList).map(e=>e.assessor_id).uniq().value();
        orgIds.push(req.user.organizationId)
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        assesseeList = _.chain(assesseeList).filter(e => !e.assessee_done).map(e => {
            return {
                startTime: e.start_time,
                endTime: e.end_time,
                name: e.name,
                target: e.target,
                content: e.template_content,
                assesseeOrgName : orgInfoMap[e.assessee_id].name,
                assessorOrgName : orgInfoMap[e.assessor_id].name,
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
    }catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};
