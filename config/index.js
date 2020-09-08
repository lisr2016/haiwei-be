const base = {
}

let env = process.env.NODE_ENV || 'development'
const config = require(`./${env}.js`)
module.exports = Object.assign({}, base, config)
