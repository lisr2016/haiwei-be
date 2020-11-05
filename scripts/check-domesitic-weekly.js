
// 每周四18点检查当前星期生活垃圾日报是否上报。未完成上报的机构用户会收到提醒。范围是所有激活状态的机构下,type为"1"、"2"的用户
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
    // let time = dayjs().startOf('day').toDate();
    // let day = `${dayjs().month()}月${dayjs().date()}日`
    // let submitted = await DomesticGarbageDaily.find({time});
    // let submittedOrg = {};
    // _.each(submitted, e => {
    //     submittedOrg[e.organization_id] = true
    // });
    // submited = null;
    
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
            title: `生活垃圾周报,请按时提交`,
            content: `请各机构于本周五14点前上报本周四当天量化数据表。 没有数据的报“0”`,
            type: '3',
            publish_time: `${dayjs().startOf('day').add(9.5,'hour').toDate()}`
        });
    }
    Message.insertMany(messages, function (err) {
        process.exit(1);
    });
}
