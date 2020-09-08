var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReportSchema = new Schema({
  consignee: {
    type: Number,
    required: true
  },
  guide: {
    type: Number,
    required: true
  },
  inspector: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Report', ReportSchema);
