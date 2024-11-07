const crypto = require('crypto')

const _size = process.argv.filter(arg => arg.startsWith("--size="))
const size = _size.length > 0 ? parseInt(_size[0].slice(7), 10) : 256

console.log(crypto.randomBytes(size).toString('base64'))
