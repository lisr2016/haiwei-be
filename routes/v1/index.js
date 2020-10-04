const router = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../../controllers')

// 获取用户信息
router.get('/user/info', ctrls.user.fetchUserInfo);
// 机构信息初始化填报
router.post('/init/org/info', ctrls.user.initOrgInfo);
// 重置密码
router.post('/reset/password', ctrls.user.resetPassword);

// 获取用户消息列表
router.get('/message/list', ctrls.message.fetchUserMessageList);
// 消息标记已读
router.get('/message/:id', ctrls.message.userMessageRead);
// 阅读消息
// router.post('/message/:id', ctrls.message.fetchMessageContent);

// 提交生活垃圾日报
router.post('/domestic/daily', ctrls.report.summitDomDaily);
// 提交生活垃圾周报
router.post('/domestic/weekly', ctrls.report.summitDomWeekly);
// 提交生活垃圾月报
router.post('/domestic/monthly', ctrls.report.summitDomMonthly);
// 提交医疗垃圾月报
router.post('/medic/monthly', ctrls.report.summitMedMonthly);

// 获取用户信息
router.get('/user/info', ctrls.user.fetchUserInfo);

module.exports = function vRouter (app) {
    app.use('/v1', router)
};
