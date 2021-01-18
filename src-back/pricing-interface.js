const request = require('superagent');
const math = require('mathjs');
const { pricingSources } = require('./constants');
const { logger } = require('./logger');

math.config({
  number: 'BigNumber',
  precision: 64
});

class PricingInterface {

  constructor(options) {
    const { source, apiKey } = options;
    this._source = source;
    this._apiKey = apiKey;
  }

  compare(coins, base) {
    return new Promise(async function(resolve) {
      try {
        const apiKey = this._apiKey;
        switch(this._source) {
          case pricingSources.CLOUD_CHAINS: {
            const endpoint = `https://chainapi-cc.core.cloudchainsinc.com/api/prices_full?from_currencies=${coins[0]}&to_currencies=${base}`;
            const { body, statusCode } = await request
              .get(endpoint)
              .set('accept', 'application/json');
            if(statusCode !== 200) {
              logger.error(`Call to ${endpoint} failed with status code ${statusCode}`);
              resolve([]);
            } else if(!body.RAW || !body.RAW || !body.RAW[coins[0]] || !body.RAW[coins[0]][base]) {
              logger.error(`Pricing data for ${coins[0]}-${base} not found in data returned from ${endpoint}`);
              resolve([]);
            } else {
              resolve([{
                coin: coins[0],
                base,
                multiplier: body.RAW[coins[0]][base].PRICE
              }]);
            }
            break;
          } case pricingSources.COIN_MARKET_CAP: {
            const { body } = await request
              .get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${coins[0]}&convert=${base}`)
              .set('X-CMC_PRO_API_KEY', apiKey);
            const { data } = body;
            resolve(Object.keys(data)
              .map(coin => {
                const { price } = body.data[coin].quote[base];
                return {
                  coin,
                  base,
                  multiplier: price
                };
              }));
            break;
          } case pricingSources.CRYPTO_COMPARE: {
            const { body } = await request
              .get(`https://min-api.cryptocompare.com/data/price?fsym=${coins[0]}&tsyms=${base}`);
            resolve([{
              coin: coins[0],
              base,
              multiplier: body[base]
            }]);
            break;
          } default:
            resolve([]);
        }
      } catch(err) {
        logger.error('PricingInterface.compare() failed with error: ' + err.message + '\n' + err.stack);
        resolve([]);
      }
    }.bind(this));
  }

}

module.exports = PricingInterface;
