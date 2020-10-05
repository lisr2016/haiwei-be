let _ = require('lodash');
let config = require('../config');
let jwt = require('jsonwebtoken');
let dayjs = require('dayjs');

let User = require('../models/User');

exports.signup = function(req, res) {
    if (!req.body.phone || !req.body.password || !req.body.orgId) {
        res.json({success: false, msg: 'Please pass phone,password,orgId .'});
    } else {
        let newUser = new User({
            phone: req.body.phone,
            password: req.body.password,
            organization_id: req.body.orgId
        });
        newUser.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'phone already exists.'});
            }
            res.json({success: true, msg: 'Successful created new user.'});
        });
    }
};

exports.login = function(req, res) {
    if (!req.body.phone || !req.body.password) {
        res.status(400).send({code: 5, msg: '缺少手机号、密码'});
        return
    }
    User.findOne({
        phone: req.body.phone
    }, function(err, user) {
        if (err) throw err;
        if (!user || user.is_deleted) {
            res.status(400).send({code: 5, msg: '用户名不存在'});
        } else {
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    user = user.toJSON();
                    user.jwtime = new Date().getTime();
                    let token = jwt.sign(user, config.secret);
                    res.json({code: 0, data: {token: token}, msg: '登陆成功'});
                } else {
                    res.status(401).send({code: 5, msg: '密码错误'});
                }
            });
        }
    });
};

exports.verifyToken = function (req, res, next) {
    let token = req.query.token || req.headers.token || req.cookies.token || req.body.token;
    if (_.isEmpty(token)) {
        res.status(401).json({ msg: `没有访问权限` });
        return
    }
    try {
        let decode = jwt.verify(token, config.secret);
        if (!decode.jwtime || dayjs(decode.jwtime).isBefore(dayjs().add(-1, 'month'))) {
            res.status(500).json({msg: `登陆已过期`});
            return;
        }
        req.user = {
            id: decode._id,
            phone: decode.phone,
            organizationId: decode.organization_id
        };
        next()
    } catch (err) {
        res.status(500).json({msg: `未能识别权限标识`})
    }
};

exports.verifyCmsToken = function (req, res, next) {
    let token = req.query.token || req.headers.token || req.cookies.token || req.body.token;
    if (_.isEmpty(token)) {
        res.status(401).json({msg: `没有访问权限`});
        return
    }
    try {
        let decode = jwt.verify(token, config.cms_secret);
        if (!decode.jwtime || dayjs(decode.jwtime).isBefore(dayjs().add(-1, 'month'))) {
            res.status(500).json({msg: `登陆已过期`});
            return;
        }
        req.admin = {
            id: decode._id,
            phone: decode.phone,
            username: decode.username,
            authority: decode.authority
        };
        next()
    } catch (err) {
        res.status(500).json({ msg: `未能识别权限标识` })
    }
};
