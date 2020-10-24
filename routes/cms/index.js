const router = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../../controllers')
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 52428800, // 50mb
        files: 1
    }
});

// 创建管理员
router.post('/cms/signup', ctrls.admin.signup);

// 管理端登陆
router.post('/cms/login', ctrls.admin.login);
// 获取管理员信息
router.get('/cms/user/info', ctrls.auth.verifyCmsToken, ctrls.admin.fetchUserInfo);
// 重置密码
router.post('/cms/reset/password', ctrls.auth.verifyCmsToken, ctrls.admin.resetPassword);

// 获取用户列表
router.post('/cms/get/user/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchUserList);
// 新增用户
router.post('/cms/new/user', ctrls.auth.verifyCmsToken, ctrls.admin.newUser);
// 删除用户
router.post('/cms/delete/user', ctrls.auth.verifyCmsToken, ctrls.admin.deleteUser);
// 修改用户密码
router.post('/cms/update/user/password', ctrls.auth.verifyCmsToken, ctrls.admin.updateUserPassword);
// 修改用户机构
router.post('/cms/update/user/org', ctrls.auth.verifyCmsToken, ctrls.admin.updateUserOrg);

// 获取机构列表
router.post('/cms/get/org/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchOrgList);
// 新增机构
router.post('/cms/new/org', ctrls.auth.verifyCmsToken, ctrls.admin.newOrg);
// 修改机构信息
router.post('/cms/update/org/info', ctrls.auth.verifyCmsToken, ctrls.admin.updateOrgInfo);
// 注销机构
router.post('/cms/delete/org', ctrls.auth.verifyCmsToken, ctrls.admin.deleteOrg);

// 获取报告列表
router.post('/cms/report/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchReportList);
// 查询报告总数
router.get('/cms/summary/total', ctrls.auth.verifyCmsToken, ctrls.admin.fetchSummaryTotal);
// 生活垃圾日报汇总
router.post('/cms/summary/domestic/daily', ctrls.auth.verifyCmsToken, ctrls.admin.fetchDomDailySummary);
// 生活垃圾周报汇总
router.post('/cms/summary/domestic/weekly', ctrls.auth.verifyCmsToken, ctrls.admin.fetchDomWeeklySummary);
// 生活垃圾月报汇总
router.post('/cms/summary/domestic/monthly', ctrls.auth.verifyCmsToken, ctrls.admin.fetchDomMonthlySummary);
// 医疗垃圾月报汇总
router.post('/cms/summary/medic/monthly', ctrls.auth.verifyCmsToken, ctrls.admin.fetchMedMonthlySummary);
// 数据大屏数据汇总
router.post('/cms/summary/screen', ctrls.auth.verifyCmsToken, ctrls.admin.fetchScreenSummary);

// 获取考核模板列表
router.post('/cms/get/assess/template/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchAssessTemplateList);
// 更新考核模板
router.post('/cms/update/assess/template', ctrls.auth.verifyCmsToken, ctrls.admin.updateAssessTemplate);
// 新增考核模板
router.post('/cms/new/assess/template', ctrls.auth.verifyCmsToken, ctrls.admin.newAssessTemplate);
// 删除考核模板
router.post('/cms/delete/assess/template', ctrls.auth.verifyCmsToken, ctrls.admin.deleteUser);

// 获取考核任务列表
router.post('/cms/get/assess/task/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchAssessTaskList);
// 新增考核任务
router.post('/cms/new/assess/task', ctrls.auth.verifyCmsToken, ctrls.admin.newAssessTask);
// 删除考核任务
router.post('/cms/delete/assess/task', ctrls.auth.verifyCmsToken, ctrls.admin.deleteTask);

// 获取政策文件列表
router.post('/cms/get/policy/list', ctrls.auth.verifyCmsToken, ctrls.admin.fetchPolicyList);
// 上传政策文件
router.post('/cms/upload/file',  upload.single('file'),  ctrls.auth.verifyCmsToken, ctrls.admin.uploadFile);
// 新增政策文件
router.post('/cms/new/policy', ctrls.auth.verifyCmsToken, ctrls.admin.newPolicy);
// 修改政策文件信息
router.post('/cms/update/policy/info', ctrls.auth.verifyCmsToken, ctrls.admin.updatePolicyInfo);
// 取消政策文件发布
router.post('/cms/cancel/policy', ctrls.auth.verifyCmsToken, ctrls.admin.cancelPolicy);

module.exports = router;
