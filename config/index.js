const base = {
    CosSecretId: 'AKIDua2E9u4r7B0lGgwsnS2PYb3oOksms4PZ',
    CosSecretKey: 'KaeaOvztcDfzZ1DE02wd5IF5aqE1DDxS',
    CosBucket: 'hw-bj-1258794828'
};

let env = process.env.NODE_ENV || 'development';
const config = require(`./${env}.js`);
module.exports = Object.assign({}, base, config);
