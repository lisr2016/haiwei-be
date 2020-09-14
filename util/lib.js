let axios = require('axios');
let appendQuery = require('append-query');

exports.sendSms = async function (phone, code) {
    try {
        let content = `#code#=${code}&#app#=海卫后勤`
        let sendurl = appendQuery('http://v.juhe.cn/sms/send', {
            key: 'ccef2ee30337d1f97f06110cedfd232d',
            mobile: phone,
            tpl_id: 42378,
            tpl_value: content
        });
        let result = await axios(sendurl)
        return result.data && result.data.error_code === 0;
    } catch (e) {
        console.log(e);
        return false;
    }
}

exports.isPhoneNum = function (content) {
    let myreg = /^[1][0-9]{10}$/;
    if (!myreg.test(content)) {
        return false;
    } else {
        return true;
    }
}
