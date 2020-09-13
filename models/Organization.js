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
  // 法人电话
  corporation_phone: {
    type: String,
    required: false
  },
  // 负责人电话
  manager_phone: {
    type: String,
    required: true
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
  // 1.三级医院、2.二级、3.一级、4.门诊部、5.诊所、6.未定级、7.医务室、8.卫生室、9.社区卫生服务中心、10.社区卫生服务站
  level: {
    type: String,
    required: true
  },
  // 街道
  street: {
    type: String,
    required: true
  }
}, {timestamps: {createAt: 'created', updateAt: 'updated'}});

module.exports = mongoose.model('organization', OrganizationSchema);
