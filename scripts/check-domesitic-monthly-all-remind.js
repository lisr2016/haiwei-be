let Organization = require('../models/Organization');
let Message = require('../models/Message');
let User = require('../models/User');
let DomesticGarbageDaily = require('../models/DomesticGarbageDaily');
let config = require('../config');
let mongoose = require('mongoose');
let dayjs = require('dayjs');
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

async function main () {
    let month = `${dayjs().month()}月`;
    
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
    
    // userIds = ['5f95a7e48b5a19d73444db8f'];
    
    let messages = [];
    for(let userId of userIds){
        messages.push({
            user_id:userId,
            title: `${month}生活垃圾月报,请按时提交`,
            content: `各单位:请5日前报垃圾处置情况台账月报，谢谢！`,
            type: '4',
            publish_time: `${dayjs().startOf('day').add(9.5,'hour').toDate()}`
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
