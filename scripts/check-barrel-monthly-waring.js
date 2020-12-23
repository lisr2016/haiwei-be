let Organization = require('../models/Organization');
let User = require('../models/User');
let Message = require('../models/Message');
let BarrelDutyMonthly = require('../models/BarrelDutyMonthly');
let config = require('../config');
let mongoose = require('mongoose');
let lib = require('../util/lib')
let dayjs = require('dayjs');
let _ = require('lodash');


mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();


async function main () {
    let time = dayjs().startOf('day').add(-4, 'day').toDate();
    let submitted = await BarrelDutyMonthly.find({time});
    let submittedOrg = {};
    _.each(submitted, e => {
        submittedOrg[e.organization_id] = true
    });

    let month = `${dayjs().month()}月`;
    let lastmonth = `${dayjs().month() === 1 ? 12: dayjs().month() - 1}月`;

    let list = [
        '5f95a27c21b931a194f51d31',
        '5f95a27c21b931a194f51d14',
        '5f95a27c21b931a194f51978',
        '5f95a27c21b931a194f51ab5',
        '5f95a27c21b931a194f51c3a',
        '5f95a27c21b931a194f51aa8',
        '5f95a27c21b931a194f5195b',
        '5f95a27c21b931a194f51d86',
        '5f95a27c21b931a194f51d62',
        '5f95a27c21b931a194f51d52',
        '5f95a27c21b931a194f51d43',
        '5f95a27c21b931a194f51d8c',
        '5f95a27c21b931a194f51aea',
        '5f95a27c21b931a194f51c38',
        '5f95a27c21b931a194f51d63',
        '5f95a27c21b931a194f51a61',
        '5f95a27c21b931a194f51d9a',
        '5f95a27c21b931a194f51a3f',
        '5f95a27c21b931a194f51c20',
        '5f95a27c21b931a194f51b59',
        '5f95a27c21b931a194f51b8a',
        '5f95a27c21b931a194f51ca1',
        '5f95a27c21b931a194f51db6',
        '5f95a27c21b931a194f51a13',
        '5f95a27c21b931a194f51d1d',
        '5f95a27c21b931a194f51915',
        '5f95a27c21b931a194f5195a',
        '5f95a27c21b931a194f51b8c',
        '5f95a27c21b931a194f51b4b',
        '5f95a27c21b931a194f51dad',
        '5f95a27c21b931a194f51b7a',
        '5f95a27c21b931a194f5197c',
        '5f95a27c21b931a194f51d5c',
        '5f95a27c21b931a194f51983',
        '5f95a27c21b931a194f51db3',
        '5f95a27c21b931a194f51987',
        '5f95a27c21b931a194f51a43',
        '5f95a27c21b931a194f51a78',
        '5f95a27c21b931a194f51d17',
        '5f95a27c21b931a194f51b23',
        '5f95a27c21b931a194f5196a',
        '5f95a27c21b931a194f51c6f',
        '5f95a27c21b931a194f51d71',
        '5f95a27c21b931a194f51986',
        '5f95a27c21b931a194f51988',
        '5f95a27c21b931a194f519d2',
        '5f95a27c21b931a194f5192c',
        '5f95a27c21b931a194f51c2e',
        '5f95a27c21b931a194f51d68',
        '5f95a27c21b931a194f51d6f',
        '5f95a27c21b931a194f51d4a',
        '5f95a27c21b931a194f51d4f',
        '5f95a27c21b931a194f51b44',
        '5f95a27c21b931a194f51db4',
        '5f95a27c21b931a194f51d8d',
        '5f95a27c21b931a194f51c25',
        '5f95a27c21b931a194f51c42',
        '5f95a27c21b931a194f51d22',
        '5f95a27c21b931a194f51bb9',
        '5f95a27c21b931a194f51937',
        '5f95a27c21b931a194f51ab8',
        '5f95a27c21b931a194f519e4',
        '5f95a27c21b931a194f51cdb',
        '5f95a27c21b931a194f51d75',
        '5f95a27c21b931a194f51d4c',
        '5f95a27c21b931a194f519e6',
        '5f95a27c21b931a194f51d3d',
        '5f95a27c21b931a194f51d5d',
        '5f95a27c21b931a194f51be9',
        '5f95a27c21b931a194f51d42',
        '5f95a27c21b931a194f5196b',
        '5f95a27c21b931a194f51a51',
        '5f95a27c21b931a194f51dc2',
        '5f95a27c21b931a194f5193b',
        '5f95a27c21b931a194f51a5a',
        '5f95a27c21b931a194f51bfa',
        '5f95a27c21b931a194f51aa8',
        '5f95a27c21b931a194f51d7c',
        '5f95a27c21b931a194f51c23',
        '5f95a27c21b931a194f51cf4',
        '5f95a27c21b931a194f51a19',
        '5f95a27c21b931a194f51c6d',
        '5f95a27c21b931a194f519bb',
        '5f95a27c21b931a194f51980',
        '5f95a27c21b931a194f51cb0',
        '5f95a27c21b931a194f51ad4',
        '5f95a27c21b931a194f51cfa',
        '5f95a27c21b931a194f51d8a',
        '5faa1eb091517761cddeef32',
        '5f95a27c21b931a194f51a86',
        '5f95a27c21b931a194f51d99',
        '5f95a27c21b931a194f51be0',
        '5f95a27c21b931a194f51946',
        '5f95a27c21b931a194f51dd2',
        '5f95a27c21b931a194f51bae',
        '5f95a27c21b931a194f51a4e',
        '5f95a27c21b931a194f51c68',
        '5f95a27c21b931a194f519a6',
        '5f95a27c21b931a194f51c6e'
    ]
    
    let userIds = [];
    let orgUn = []
    let orgs = await Organization.find({_id:{$in: list}});
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
    let users = await User.find({_id:{$in: userIds}});
    
    users = _.keyBy(users, '_id')
    
    for(let userId of userIds){
        if(users[userId]) {
            await lib.smsBarrel(users[userId].phone)
        }
    }
    process.exit(1);
}
