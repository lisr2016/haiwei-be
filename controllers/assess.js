let _ = require('lodash');
let Assess = require('../models/AssessTask');
let Organization = require('../models/Organization');
let UploadFileLog = require('../models/UploadFileLog');
let Joi = require('joi');
let lib = require('../util/lib');
let { v4: uuidv4 } = require('uuid');
let { formatTime } = require('../util/lib');

exports.fetchUserAssessList = async function (req, res) {
    let user = req.user;
    try {
        let assesseeList = await Assess.find({assessee_id: user.organizationId});
        let assessorList = await Assess.find({assessor_id: user.organizationId});
        let orgIds = _.chain(assesseeList).map(e => e.assessor_id).value();
        let orgIds2 = _.chain(assessorList).map(e => e.assessee_id).value();
        orgIds = _.chain(orgIds).concat(orgIds2).concat([req.user.organizationId]).uniq().value();
        const orgs = await Organization.find({_id: {$in: orgIds}});
        const orgInfoMap = _.keyBy(orgs, '_id');
        assesseeList = _.concat(assesseeList,assessorList);
        assesseeList = _.chain(assesseeList).filter(e => !e.assessee_done).map(e => {
            return {
                id: e._id,
                startTime: formatTime(e.start_time && e.start_time.getTime()),
                endTime: formatTime(e.end_time && e.end_time.getTime()),
                name: e.name,
                target: e.target,
                content: e.template_content,
                assesseeOrgName: e.assessee_id && orgInfoMap[e.assessee_id] && orgInfoMap[e.assessee_id].name,
                assessorOrgName: e.assessor_id && orgInfoMap[e.assessor_id] && orgInfoMap[e.assessor_id].name,
                type: e.type,
                createTime: formatTime(e.createdAt && e.createdAt.getTime())
            }
        }).value();
        res.status(200).send({code: 0, data: assesseeList, msg: '查询成功'});
    } catch (e) {
        console.log(e)
        res.status(400).send({code: 5, msg: '查询失败'});
    }
};

const uploadAssessSchema = {
    id: Joi.string().required(),
    type: Joi.string().required(),
    content: Joi.array().required(),
};

exports.uploadAssess = async function (req, res) {
    try {
        const uploadAssessInfo = await Joi.validate(req.body, uploadAssessSchema);
        let updateInfo = {};
        switch (uploadAssessInfo.type) {
            case '1':
                updateInfo.assessor_content = uploadAssessInfo.content;
                updateInfo.assessor_done = true;
                break;
            case '2':
                updateInfo.assessee_content = uploadAssessInfo.content;
                updateInfo.assessee_done = true;
                break;
            default:
                res.status(400).send({code: 5, msg: 'type类型错误'});
                return
        }
        await Assess.updateOne({
            _id: uploadAssessInfo.id
        }, updateInfo);
        res.status(200).send({code: 0, msg: '提交成功'});
    } catch (e) {
        let data = '';
        if (_.size(e.details) > 0) {
            _.each(e.details, item => {
                data += item.message;
            });
        }
        console.log(e);
        res.status(400).send({code: 5, data, msg: '提交失败'});
    }
};

exports.uploadPics = async function (req, res) {
    try {
        if (!_.size(req.file)) {
            res.status(400).json({code: 5, msg: '未发现上传文件'});
            return;
        }
        if (!(_.size(req.body.taskId) && _.size(req.body.contentIndex) && _.size(req.body.picIndex))) {
            res.status(400).json({code: 5, msg: 'taskId、contentIndex 或 picIndex参数错误'});
            return;
        }
        if (!req.body.filename) {
            res.status(400).json({code: 5, msg: '缺少filename参数'});
            return;
        }
        let size = req.file.size;
        if (_.last(req.file.originalname.split('.')) !== _.last(req.body.filename.split('.'))) {
            res.status(400).json({code: 5, msg: 'filename 文件类型和上传文件不匹配'});
            return;
        }
        const suffixFilter = ['jpeg', 'jpg', 'gif', 'bmp', 'png'];
        if (!_.includes(suffixFilter, _.last(req.file.originalname.split('.')))) {
            res.status(400).json({code: 5, msg: '文件类型错误，请上传 jpeg, jpg, gif, bmp, png 文件'});
            return;
        }
        let key = `policy/${uuidv4()}/${req.body.filename}`;
        let buffer = req.file.buffer;
        let result = await lib.cosPutObject(key, buffer);
        if (result.statusCode === 200) {
            const newUploadFileLog = new UploadFileLog({
                uploader: req.user.phone,
                is_success: true,
                size: size,
                key: key,
            });
            await newUploadFileLog.save();
            let result = await lib.cosGetObjectUrl(key);
            res.status(200).json({code: 0, data: result.Url, msg: '上传成功'});
            return
        }
        const newUploadFileLog = new UploadFileLog({
            uploader: req.user.phone,
            is_success: false,
            size: size,
            key: key,
        });
        await newUploadFileLog.save();
        res.status(400).json({code: 0, msg: '上传失败'});
    } catch (e) {
        console.log(e);
        res.status(400).send({code: 5, msg: '上传失败'});
    }
};
