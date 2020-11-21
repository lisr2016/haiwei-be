const router = require('express').Router();
const requireDir = require('require-dir');
const ctrls = requireDir('../../controllers');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 52428800, // 20mb
        files: 9
    }
});

// 获取用户信息
router.get('/user/info', ctrls.user.fetchUserInfo);
// 机构信息初始化填报
router.post('/init/org/info', ctrls.user.initOrgInfo);
// 重置密码
router.post('/reset/password', ctrls.user.resetPassword);

// 获取用户考核任务
router.get('/assess/list', ctrls.assess.fetchUserAssessList);
// 用户上传图片
router.post('/upload/pic', upload.array('file',9),  ctrls.assess.uploadPics);
// 获取用户提交考核
router.post('/upload/assess', ctrls.assess.uploadAssess);

// 获取用户消息列表
router.get('/message/list', ctrls.message.fetchUserMessageList);
// 消息标记已读
router.get('/message/:id', ctrls.message.userMessageRead);

// 提交生活垃圾日报
router.post('/domestic/daily', ctrls.report.summitDomDaily);
// 提交生活垃圾周报
router.post('/domestic/weekly', ctrls.report.summitDomWeekly);
// 提交生活垃圾月报
router.post('/domestic/monthly', ctrls.report.summitDomMonthly);
// 提交桶前值守月报
router.post('/barrel/monthly', ctrls.report.summitBarrelMonthly);
// 提交医疗垃圾月报
router.post('/medic/monthly', ctrls.report.summitMedMonthly);

// 获取政策文件列表
router.get('/get/policy/list', ctrls.policy.fetchPolicyList);

// 获取用户信息
router.get('/user/info', ctrls.user.fetchUserInfo);

// 监督员指派任务
router.post('/assessment', ctrls.user.newAssessTask);

module.exports = function vRouter (app) {
    app.use('/v1', router)
};
