let Organization = require('../models/Organization');
let User = require('../models/User');
let Message = require('../models/Message');
let DomesticGarbageDaily = require('../models/DomesticGarbageDaily');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();


async function main () {
    let month = `${dayjs().month()}月`;
    let lastmonth = `${dayjs().month() === 1 ? 12: dayjs().month() - 1}月`;
    let userIds = [];
    let orgs = await Organization.find({is_deleted:{$ne:true}});
    let forbidUserIds = {};
    _.each(orgs, org => {
        let addUserIds = _.chain(org.registed_users).keys().filter(e => !forbidUserIds[e]
        ).value();
        userIds = _.concat(userIds,addUserIds)
    });

    let messages = [];
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `${month}桶前值守月报,请按时提交`,
            content: `请各机构提交${lastmonth}18日-${month}18日桶前值守人数(不是人次数)，谢谢！`,
            type: '1',
            publish_time: `${dayjs().startOf('day').add(9.5,'hour').toDate()}`
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
