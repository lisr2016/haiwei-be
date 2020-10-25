let Organization = require('../models/Organization');
let config = require('../config');
let mongoose = require('mongoose');

let Excel = require('exceljs');

mongoose.connect(config.database, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true});

main();

// 每周月第一天上午10：05检查上月生活垃圾日报是否上报。未完成上报的机构用户会收到提醒。范围是所有激活状态的机构下,type为"1"、"2"的用户

async function main () {
    const wb = new Excel.Workbook();
    await wb.xlsx.readFile('./scripts/orgList.xlsx');
    const ws = wb.worksheets[0];
    const orgTypeMap = {
        '门诊部':'4',
        '诊所':'5',
        '医务室':'7',
        '卫生室':'8',
        '社区卫生服务中心':'9',
        '社区卫生服务站':'10'
    };
    let orgKeys = Object.keys(orgTypeMap);

    const orgs = [];
    for (let i = 2;i < 1261;i++){
        const name = ws.getCell(`A${i}`).value;
        const address = ws.getCell(`B${i}`).value;
        let level = '6';
        for(let j of orgKeys){
            if(name.indexOf(j)>0){
                level = orgTypeMap[j]
            }
        }
        let orgInfo = {
            name: name,
            level: level,
            address: address,
            manager_phone: ws.getCell(`C${i}`).value
        };
        orgs.push(orgInfo)
    }
    console.log(orgs[orgs.length - 1])
    Organization.insertMany(orgs, function (err) {
        // console.log(err);
        process.exit(1);
    });
}
