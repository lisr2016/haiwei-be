let _ = require('lodash');
let Joi = require('Joi');

let Policy = require("../models/Policy");

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
