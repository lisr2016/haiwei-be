let _ = require('lodash');
let Assess = require("../models/AssessTask");

exports.fetchUserAssessList = async function (req, res) {
    let user = req.user;
    try {
        let assesseeList = await Assess.find({assessee_id: user.organizationId});
        assesseeList = _.chain(assesseeList).filter(e => !e.assessee_done).map(e => {
            return {
                startTime: e.start_time,
                endTime: e.end_time,
                name: e.name,
                target: e.target,
                content: e.template_content,
                type: '2',
                createTime: e.createdAt
            }
        });
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
