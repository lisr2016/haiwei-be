var exports = module.exports = {};

let Report = require("../models/Report");

exports.newReport = function(req, res) {
    // let token = getToken(req.headers);
    // if (token) {
        let newReport = new Report({
            consignee: req.body.consignee,
            guide: req.body.guide,
            inspector: req.body.inspector
        });
    
        newReport.save(function(err) {
            console.log(err)
            if (err) {
                return res.json({success: false, msg: 'Save book failed.'});
            }
            res.json({success: true, msg: 'Successful created new book.'});
        });
    // } else {
    //     return res.status(403).send({success: false, msg: 'Unauthorized.'});
    // }
};

exports.reportsList = function(req, res) {
    // let token = getToken(req.headers);
    // if (token) {
        Report.find(function (err, books) {
            if (err) return next(err);
            res.json(books);
        });
    // } else {
    //     return res.status(403).send({success: false, msg: 'Unauthorized.'});
    // }
};

getToken = function (headers) {
    if (headers && headers.authorization) {
        let parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};
