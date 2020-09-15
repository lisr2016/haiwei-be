const router = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../../controllers')

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

// 修改用户信息
router.post('/cms/update/user/info', ctrls.auth.verifyCmsToken, ctrls.admin.updateUserInfo);

// 修改机构信息
router.post('/cms/update/org/info', ctrls.auth.verifyCmsToken, ctrls.admin.updateOrgInfo);

// 获取量化填报汇总数据
router.post('/cms/report/summary', ctrls.auth.verifyCmsToken, ctrls.admin.fetchReportSummay);

module.exports = router;
