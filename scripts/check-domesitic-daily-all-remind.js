let Organization = require('../models/Organization');
let Message = require('../models/Message');
let User = require('../models/User');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

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
    let messages = [];
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `${day}生活垃圾日报提交提醒`,
            content: `请您按时上报${day}垃圾分类工作日报，谢谢！`,
            type: '2',
            publish_time: `${dayjs().startOf('day').add(9,'hour').toDate()}`
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
