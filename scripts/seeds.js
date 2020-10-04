let Organization = require('../models/Organization');
let config = require('../config');
let mongoose = require('mongoose');

mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

async function main () {
    
    // test orgs
    // const managerPhone = '13000000000';
    // const corporationPhone = '13000000000';
    // let name = '测试机构'
    // let orgs = [];
    // for (let i = 1; i < 1000; i++) {
    //     let newOrganization = new Organization({
    //         name: name + i,
    //         manager_phone: managerPhone,
    //         corporation_phone: corporationPhone,
    //         address: 'test',
    //         level: '1',
    //         street: 'test',
    //     });
    //     orgs.push(newOrganization)
    // }
    //
    // Organization.insertMany(orgs, function (err) {
    //     console.log(err);
    //     process.exit(1);
    // });
}
