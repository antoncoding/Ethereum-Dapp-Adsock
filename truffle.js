// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      gas: 4612388,
      network_id: '*' // Match any network id
    }
  }
}
