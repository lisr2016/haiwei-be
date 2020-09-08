const rootRouter = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../../controllers')


rootRouter.post('/report', ctrls.report.newReport);
rootRouter.get('/report', ctrls.report.reportsList);
rootRouter.post('/signup', ctrls.auth.signup);
rootRouter.post('/signin', ctrls.auth.signin);

module.exports = function vRouter (app) {
    app.use('/v1', rootRouter)
}
