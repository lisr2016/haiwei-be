let _ = require('lodash');
let Joi = require('joi');

let Policy = require("../models/Policy");



exports.fetchPolicyList = async function (req, res) {
    try {

        let list = await Policy.find();
        list = _.map(list, e => {
            return {
                id: e._id,
                title: e.title,
                content: e.content,
                isDeleted: e.is_deleted,
                publisher: e.admin_name,
                url: e.url,
                filename: e.filename,
                createTime: e.createdAt && e.createdAt.getTime()
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
