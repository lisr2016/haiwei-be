const router = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../controllers')

router.post('/signup', ctrls.auth.signup);
router.post('/org/signup', ctrls.auth.orgsignup);

// 用户登陆
router.post('/login', ctrls.auth.login);

// 获取验证码

// 校验验证码

module.exports = router
