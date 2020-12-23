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
    let userIds = [];
    let orgs = await Organization.find({is_deleted:{$ne:true}});
    let data = await User.find({type:'2'});
    let forbidUserIds = {};
    _.each(data, e => {
        forbidUserIds[e._id] = true
    });
    _.each(orgs, org => {
        let addUserIds = _.chain(org.registed_users).keys().filter(e => !forbidUserIds[e]
        ).value();
        userIds = _.concat(userIds,addUserIds)
    });
    // let messages = [];
    for(let userId of userIds){

    }
    // Message.insertMany(messages, function (err) {
    //     process.exit(1);
    // });
}
