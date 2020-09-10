var exports = module.exports = {};

let Report = require("../models/Report");

exports.newAssess = function(req, res) {
    // let token = getToken(req.headers);
    // if (token) {
        let newReport = new Report({
            consignee: req.body.consignee || 0,
            guide: req.body.guide || 0,
            inspector: req.body.inspector || 0,
            kitchen_waste_collector: req.body.kitchenWasteCollector || 0,
            kitchen_waste_positon: req.body.kitchenWastePositon || 0,
            recyclable_waste_collector: req.body.recyclableWasteCollector || 0,
            recyclable_waste_positon: req.body.recyclableWastePositon || 0,
            harmful_waste_collector: req.body.harmfulWasteCollector || 0,
            harmful_waste_positon: req.body.harmfulWastePositon || 0,
            kitchen_waste: req.body.kitchenWaste || 0,
            recyclable_waste: req.body.recyclableWaste || 0,
            harmful_waste: req.body.harmfulWaste || 0,
            bulky_waste: req.body.bulkyWaste || 0,
            other_waste: req.body.otherWaste || 0,
        });
    
        newReport.save(function(err) {
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
