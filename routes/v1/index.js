const rootRouter = require('express').Router()
const requireDir = require('require-dir')
const ctrls = requireDir('../../controllers')


rootRouter.post('/report', ctrls.report.newReport);
rootRouter.post('/assess', ctrls.assess.newAssess);
rootRouter.get('/report', ctrls.report.reportsList);

module.exports = function vRouter (app) {
    app.use('/v1', rootRouter)
}
