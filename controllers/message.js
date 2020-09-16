let _ = require('lodash');
let config = require('../config');

let Message = require("../models/Message");

exports.fetchUserMessageList = async function (req, res) {
    let user = req.user
    try {
        let messageList = await Message.find({user_id: user.id})
        let data = _.chain(messageList).filter(e => !e.is_read).map(e => {
            return {
                id: e._id,
                content: e.content,
                title: e.title,
                type: e.type,
                isRead: e.is_read,
                createTime: e.createAt
            }
        }).value()
        res.status(200).send({code: 0, data, msg: '查询成功'});
    }catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

exports.userMessageRead = async function (req, res) {
    let user = req.user;
    let id = req.params.id;
    try {
        if (!_.isString(id)) {
            res.status(400).send({code: 5, msg: '参数错误'});
            return
        }
        await Message.updateOne({_id: id, user_id: user.id}, {is_read: true});
        res.status(200).send({code: 0, msg: '更新成功'});
    } catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '更新失败'});
    }
};

