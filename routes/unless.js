const router = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../controllers')

router.post('/signup', ctrls.auth.signup);
router.post('/login', ctrls.auth.login);

module.exports = router
