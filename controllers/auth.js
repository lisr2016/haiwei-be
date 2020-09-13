// let exports = module.exports = {};
let _ = require('lodash');
let config = require('../config'),
    jwt = require('jsonwebtoken');

let User = require("../models/User");

exports.signup = function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        let newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        newUser.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
};

exports.login = function(req, res) {
    User.findOne({
        username: req.body.username
    }, function(err, user) {
        if (err) throw err;
        if (!user) {
            res.status(401).send({success: false, msg: '用户名不存在'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    let token = jwt.sign(user.toJSON(), config.secret);
                    res.json({success: true, token: 'JWT ' + token});
                } else {
                    res.status(401).send({success: false, msg: '密码错误'});
                }
            });
        }
    });
};

exports.verifyToken = async function (req, res, next) {
    let token = req.query.token || req.headers.token || req.cookies.token || req.body.token
    if (_.isEmpty(token)) {
        res.status(401).json({ msg: `没有访问权限` })
        return
    }
    try {
        let decode = jwt.verify(token, config.secret)
        req.user = decode.user || decode
        next()
    } catch (err) {
        res.status(500).json({ msg: `未能识别权限标识` })
    }
}
