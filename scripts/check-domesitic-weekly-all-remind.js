
// 每周四18点检查当前星期生活垃圾日报是否上报。未完成上报的机构用户会收到提醒。范围是所有激活状态的机构下,type为"1"、"2"的用户
let Organization = require('../models/Organization');
let Message = require('../models/Message');
let User = require('../models/User');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let lib = require('../util/lib')
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

async function main () {
    let time = dayjs().startOf('day').add(-4, 'day').toDate();
    let day = `${dayjs().month()}月${dayjs().date()}日`
    let submittedOrg = {};
    let userIds = [];
   let orgUn = []
    
    let orgs = await Organization.find();
    let data = await User.find({type:'3'});
    let forbidUserIds = {};
    _.each(data, e => {
        forbidUserIds[e._id] = true
    });
    _.each(orgs, org => {
        if(!submittedOrg[org._id]) {
            orgUn.push(org.name)
            let addUserIds = _.chain(org.registed_users).keys().filter(e => !forbidUserIds[e]
            ).value();
            userIds = _.concat(userIds, addUserIds)
        }
    });
    
    let messages = [];
    
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `生活垃圾周报,请按时提交`,
            content: `您尚未提交机构本周生活垃圾周报,请抓紧在今天14:00前完成`,
            type: '3',
            publish_time: `${dayjs().startOf('day').add(8,'hour').toDate()}`
        });
    }
    // console.log(messages)
    Message.insertMany(messages, function (err) {
        console.log(err)
        process.exit(1);
    });
    // process.exit(1);
}
