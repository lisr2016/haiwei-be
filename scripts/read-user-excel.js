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
    for (let i = 2;i < 101;i++){
        const orgName = ws.getCell(`B${i}`).value;
        const domConcact = ws.getCell(`C${i}`).value;
        const domPhone = ws.getCell(`D${i}`).value;
        const medConcact = ws.getCell(`E${i}`).value;
        const medPhone = ws.getCell(`F${i}`).value;
        let orgId = await Organization.findOne({name: new RegExp(orgName)},'_id');
        if(!orgId) {
            orgId = await Organization.findOne({name: orgName},'_id');
        }
        if(domConcact === medConcact){
            user.push({
            phone:domPhone,
            password,
            organization_id:orgId._id,
            type:'1'
            })
        }else{
            user.push({
                phone:domPhone,
                password,
                organization_id:orgId._id,
                type:'2'
            })
            user.push({
                phone:medPhone,
                password,
                organization_id:orgId._id,
                type:'3'
            })
        }
    }
    // _.each(user,i => {
    //     console.log(i.phone)
    //     console.log(i.organization_id)
    // })
    let result = await User.insertMany(user)
    console.log(result)
    // User.insertMany(user, function (err) {
    //     if(err) {
    //         console.log(err);
    //     }
        process.exit(1);
    // });
}
