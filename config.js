const dotenv = require('dotenv')
const dotenvParseVariables = require('dotenv-parse-variables');

let env = dotenv.config({ path: '.env' })
if (env.error) throw env.error
env = dotenvParseVariables(env.parsed)

module.exports = {
  port: env.PORT,
  stockPriceUrl: env.STOCK_PRICE_URL,
  ivrCompanies: env.IVR_COMPANIES,
  ivrSymbols: env.IVR_SYMBOLS,
  port: process.env.PORT
}; 