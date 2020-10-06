let _ = require('lodash');
let config = require('../config');
let jwt = require('jsonwebtoken');
let dayjs = require('dayjs');
let Joi = require('joi');
const bcrypt = require('bcrypt-nodejs');

let User = require('../models/User');

exports.login = function (req, res) {
    const phone = req.body.phone;
    const password = req.body.password;
    const verifyCode = req.body.verifyCode;
    if (!phone || !password || !verifyCode) {
        res.status(400).send({code: 5, msg: '手机号、密码或验证码缺少'});
        return
    }
    if (req.session[phone] !== verifyCode) {
        res.status(200).send({code: 5, msg: '验证码错误'});
        return
    }
    User.findOne({
        phone
    }, function (err, user) {
        if (err) throw err;
        if (!user || user.is_deleted) {
            res.status(400).send({code: 5, msg: '用户名不存在'});
        } else {
            user.comparePassword(password, function (err, isMatch) {
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
        res.status(401).json({msg: `没有访问权限`});
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
        res.status(500).json({msg: `未能识别权限标识`})
    }
};

const signUpSchema = {
    phone: Joi.string().required(),
    password: Joi.string().required(),
    organizationId: Joi.string().required(),
    verifyCode: Joi.string().required(),
};

exports.signUp = async function (req, res) {
    try {
        const signUpInfo = await Joi.validate(req.body, signUpSchema);
        if (req.session[signUpInfo.phone] !== signUpInfo.verifyCode) {
            res.status(400).send({code: 5, msg: '验证码错误'});
            return
        }
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                res.status(400).send({code: 5, msg: '更新失败'});
                return
            }
            bcrypt.hash(signUpInfo.password, salt, null, function (err, hash) {
                if (err) {
                    res.status(400).send({code: 5, msg: '更新失败'});
                    return
                }
                let updateInfo = {
                    phone: signUpInfo.phone,
                    password: hash,
                    organization_id: signUpInfo.organizationId,
                    is_deleted: false
                };
                User.updateOne({phone: signUpInfo.phone}, updateInfo, {upsert: true}, function (err) {
                    if (err) {
                        res.status(400).send({code: 5, msg: '更新失败'});
                        return
                    }
                    User.findOne({phone: req.body.phone}, function (err, user) {
                        if (err || !user) {
                            res.status(400).send({code: 5, data, msg: '注册失败'});
                            return
                        }
                        user = user.toJSON();
                        user.jwtime = new Date().getTime();
                        let token = jwt.sign(user, config.secret);
                        res.json({code: 0, data: {token: token}, msg: '注册成功'});
                    });
                });
            });
        });
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '注册失败'});
    }
};
