let _ = require('lodash');
let { formatTime } = require('../util/lib');
let Organization = require("../models/Organization");
let Policy = require("../models/Policy");
const ObjectId = require('mongodb').ObjectId;

exports.fetchPolicyList = async function (req, res) {
    try {
        let orgId = req.user && req.user.organizationId;
        let orgInfo = await Organization.findOne({'_id': new ObjectId(orgId)});
        if (!orgInfo) {
            res.status(400).send({code: 5, msg: '用户所属机构信息错误,请联系管理员'});
            return
        }
        let level = orgInfo.level;
        let list = await Policy.find();
        list = _.chain(list).filter(e => !_.size(e.levels) || _.includes(e.levels, level)).map(e => {
            return {
                id: e._id,
                title: e.title,
                content: e.content,
                isDeleted: e.is_deleted,
                publisher: e.admin_name,
                url: e.url,
                filename: e.filename,
                createTime: formatTime(e.createdAt && e.createdAt.getTime())
            }
        }).value();
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
