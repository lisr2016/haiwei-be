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
            content: `请各机构本周五14点前上报本周四当天量化数据表。没有数据的报"0"。`,
            type: '3',
            publish_time: `${dayjs().startOf('day').add(8,'hour').toDate()}`
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
