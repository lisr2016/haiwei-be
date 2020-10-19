var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrganizationSchema = new Schema({
  // 名称
  name : {
    type: String,
    unique: true,
    required: true
  },
  // 基础信息是否初始化
  is_initiated: {
    type: Boolean,
    default: false
  },
  // 注册在组织下的userId
  // { 'userId' : true }
  registed_users: {
    type: Object,
  },
  // 法人电话
  corporation_phone: {
    type: String,
    required: false
  },
  // 负责人电话
  manager_phone: {
    type: String,
    required: false
  },
  // 床位数
  bednum: {
    type: Number,
    required: false
  },
  // 地址
  address: {
    type: String,
    required: true
  },
  // 级别
  // 1.三级医院、2.二级医院、3.一级医院、4.门诊部、5.诊所、6.未定级、7.医务室、8.卫生室、9.社区卫生服务中心、10.社区卫生服务站
  level: {
    type: String,
    required: true,
  },
  // 街道
  street: {
    type: String,
    required: false
  },
  // 注册类型  1:预设联系方式  2:开放注册
  type: {
    type: String,
    default: '2'
  },
  // 是否已注销
  is_deleted: {
    type: Boolean,
    default: false
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

OrganizationSchema.index({ name: 1 });

module.exports = mongoose.model('organization', OrganizationSchema);
