let Organization = require('../models/Organization');
let User = require('../models/User');
let config = require('../config');
let mongoose = require('mongoose');
let _ = require('lodash')

let Excel = require('exceljs');

mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

async function main () {
    const wb = new Excel.Workbook();
    await wb.xlsx.readFile('./scripts/userList.xlsx');
    const ws = wb.worksheets[0];
    const user = [];
    let password = '$2a$10$PuSvU1ELs040JBBWVGHW1uCVB8Wxuc7N4lb1sR4a6nyCfIMpLtv7W'
    let orgList = []
    for (let i = 2;i < 130;i++){
        // console.log(i)
        const orgName = ws.getCell(`B${i}`).value;
        const domConcact = ws.getCell(`C${i}`).value;
        const domPhone = ws.getCell(`D${i}`).value;
        const medConcact = ws.getCell(`E${i}`).value;
        const medPhone = ws.getCell(`F${i}`).value;
        let orgId = await Organization.findOne({name: new RegExp(orgName)},'_id');
        if(!orgId) {
            orgId = await Organization.findOne({name: orgName},'_id');
        }
        if(!orgId){
            console.log(orgName);
            continue;
        }
        orgList.push(orgId._id.toString())
        // if(domConcact === medConcact){
        //     let newUser = new User({
        //         phone:domPhone,
        //         password,
        //         organization_id:orgId._id,
        //         type:'1'
        //     });
        //     await newUser.save();
        //     let user = await User.findOne({phone:domPhone});
        //     const updateInfo = {registed_users: orgId.registed_users || {}};
        //     updateInfo.registed_users[`${user._id}`] = true;
        //     let result = await Organization.updateOne({_id: orgId._id}, updateInfo)
        // }else{
        //     let newUser1 = new User({
        //         phone:domPhone,
        //         password,
        //         organization_id:orgId._id,
        //         type:'2'
        //     });
        //     await newUser1.save();
        //     let user1 = await User.findOne({phone:domPhone});
        //     const updateInfo = {registed_users: orgId.registed_users || {}};
        //     updateInfo.registed_users[`${user1._id}`] = true;
        //     //
        //
        //
        //     let newUser2 = new User({
        //         phone:medPhone,
        //         password,
        //         organization_id:orgId._id,
        //         type:'3'
        //     });
        //     await newUser2.save();
        //     let user2 = await User.findOne({phone:domPhone});
        //     updateInfo.registed_users[`${user2._id}`] = true;
        //     let result  = await Organization.updateOne({_id: orgId._id}, updateInfo)
        //     console.log(result)
        // }
    }
    // let result = await User.insertMany(user)
    // console.log(result)
    // User.insertMany(user, function (err) {
    //     if(err) {
    //         console.log(err);
    //     }
    console.log(orgList)
        process.exit(1);
    // });
}
