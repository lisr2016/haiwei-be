let Organization = require('../models/Organization');
let Message = require('../models/Message');
let User = require('../models/User');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let _ = require('lodash');
let lib = require('../util/lib')

mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

// 每天上午9点发送。范围是所有激活状态的机构下,type为"1"、"2"的用户

async function main () {
    let day = `${dayjs().month() + 1}月${dayjs().date()}日`
    submited = null;
    let userIds = [];
    let orgs = await Organization.find({is_deleted:{$ne:true}});
    let data = await User.find({type:'3'});
    let forbidUserIds = {};
    _.each(data, e => {
        forbidUserIds[e._id] = true
    });
    _.each(orgs, org => {
        let addUserIds = _.chain(org.registed_users).keys().filter(e => !forbidUserIds[e]
        ).value();
        userIds = _.concat(userIds,addUserIds)
    });
    orgs = null;
    let users = await User.find({_id:{$in: userIds}});
    
    users = _.keyBy(users, '_id')
    let messages = [];
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `桶前值守月报提交提醒`,
            content: `请您按时上报本月桶前值守月报，谢谢！`,
            type: '1',
            publish_time: `${dayjs().startOf('day').add(15,'hour').toDate()}`
        });
        if(users[userId]) {
            await lib.smsBarrel(users[userId].phone)
        }
    }
    // Message.insertMany(messages, function (err) {
    //     process.exit(1);
    // });
}
