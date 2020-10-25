let Organization = require('../models/Organization');
let Message = require('../models/Message');
let DomesticGarbageDaily = require('../models/DomesticGarbageDaily');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

// 每天16点10分检查当日生活垃圾日报是否仍未上报。未完成上报的机构用户会收到提醒。范围是所有激活状态的机构下,type为"1"、"2"的用户

async function main () {
    let time = dayjs().startOf('day').toDate();
    let day = `${dayjs().month()}月${dayjs().date()}日`
    let submitted = await DomesticGarbageDaily.find({time});
    let submittedOrg = {};
    _.each(submitted, e => {
        submittedOrg[e.organization_id] = true
    });
    submited = null;
    let userIds = [];
    let orgs = await Organization.find({is_deleted:{$ne:true}});
    _.each(orgs, org => {
        if (org && org._id && !submittedOrg[org._id]) userIds = _.concat(userIds,_.keys(org.registed_users))
    });
    orgs = null;
    let messages = [];
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `${day}生活垃圾日报,未按时提交`,
            content: `${day}生活垃圾日报,已超时，点击下方按钮前往补交`,
            type: '2'
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
