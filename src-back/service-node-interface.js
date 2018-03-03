const request = require('superagent');

/**
 * @typedef {Object} OrderObject
 * @property {string} id
 * @property {string} maker
 * @property {string} makerSize
 * @property {string} makerAddress
 * @property {string} taker
 * @property {string} takerSize
 * @property {string} takerAddress
 * @property {string} updatedAt
 * @property {string} createdAt
 * @property {string} status
 */

/**
 * Constructs an order object.
 * @param {Object} data
 * @returns {OrderObject}
 * @constructor
 */
const Order = data => ({
  id: data.id || '',
  maker: data.maker || '',
  makerSize: data.maker_size || '',
  makerAddress: data.maker_address || '',
  taker: data.taker || '',
  takerSize: data.taker_size || '',
  takerAddress: data.taker_address || '',
  updatedAt: data.updated_at || '',
  createdAt: data.created_at || '',
  status: data.status || ''
});

/**
 * @typedef {Object} TradeObject
 * @property {string} id
 * @property {string} time
 * @property {string} maker
 * @property {string} makerSize
 * @property {string} makerTXID
 * @property {string} taker
 * @property {string} takerSize
 * @property {string} takerTXID
 */

/**
 * Constructs a trade object.
 * @param data
 * @returns {TradeObject}
 * @constructor
 */
const Trade = data => ({
  id: data.id || '',
  time: data.time || '',
  maker: data.maker || '',
  makerSize: data.maker_size || '',
  makerTXID: data.maker_txid || '',
  taker: data.taker || '',
  takerSize: data.taker_size || '',
  takerTXID: data.taker_txid || ''
});

/**
 * @typedef {Object} OrderHistoryObject
 * @property {string} time
 * @property {number} low
 * @property {number} high
 * @property {number} open
 * @property {number} close
 * @property {number} volume
 */

/**
 * Constructs an order history object.
 * @param data
 * @returns {OrderHistoryObject}
 * @constructor
 */
const OrderHistory = data => ({
  time: data.time || '',
  low: data.low || 0,
  high: data.high || 0,
  open: data.open || 0,
  close: data.close || 0,
  volume: data.volume || 0
});

/**
 * @typedef {Object} BidAskObject1
 * @property {string} price
 * @property {string} size
 * @property {number} orderCount
 */

/**
 * Constructs a bid/ask level 1 object
 * @param {Object} data
 * @returns {BidAskObject1}
 * @constructor
 */
const BidAsk1 = data => ({
  price: data[0],
  size: data[1],
  orderCount: data[2]
});

/**
 * @typedef {Object} OrderBookObject1
 * @property {number} detail
 * @property {string} maker
 * @property {string} taker
 * @property {BidAskObject1[]} bids
 * @property {BidAskObject1[]} asks
 */

/**
 * Constructs an order book level 1 and 2 object
 * @param {Object} data
 * @returns {OrderBookObject1}
 * @constructor
 */
const OrderBook1 = data => ({
  detail: data.detail || 0,
  maker: data.maker || '',
  taker: data.taker || '',
  bids: data.bids.map(BidAsk1),
  asks: data.asks.map(BidAsk1)
});

/**
 * @typedef {Object} BidAskObject3
 * @property {string} price
 * @property {string} size
 * @property {string} orderId
 */

/**
 * Constructs a bid/ask level 3 object
 * @param {Object} data
 * @returns {BidAskObject3}
 * @constructor
 */
const BidAsk3 = data => ({
  price: data[0],
  size: data[1],
  orderId: data[2]
});

/**
 * @typedef {Object} OrderBookObject3
 * @property {number} detail
 * @property {string} maker
 * @property {string} taker
 * @property {BidAskObject3[]} bids
 * @property {BidAskObject3[]} asks
 */

/**
 * Constructs an order book level 3 object
 * @param {Object} data
 * @returns {OrderBookObject3}
 * @constructor
 */
const OrderBook3 = data => ({
  detail: data.detail || 0,
  maker: data.maker || '',
  taker: data.taker || '',
  bids: data.bids.map(BidAsk3),
  asks: data.asks.map(BidAsk3)
});

/**
 * @typedef {Object} BidAskObject4
 * @property {string} price
 * @property {string} size
 * @property {string[]} orderIds
 */

/**
 * Constructs a bid/ask level 4 object
 * @param {Object} data
 * @returns {BidAskObject4}
 * @constructor
 */
const BidAsk4 = data => ({
  price: data[0],
  size: data[1],
  orderIds: data[2]
});

/**
 * @typedef {Object} OrderBookObject4
 * @property {number} detail
 * @property {string} maker
 * @property {string} taker
 * @property {BidAskObject4[]} bids
 * @property {BidAskObject4[]} asks
 */

/**
 * Constructs an order book level 4 object
 * @param {Object} data
 * @returns {OrderBookObject4}
 * @constructor
 */
const OrderBook4 = data => ({
  detail: data.detail || 0,
  maker: data.maker || '',
  taker: data.taker || '',
  bids: data.bids.map(BidAsk4),
  asks: data.asks.map(BidAsk4)
});

/**
 * Class representing a service node interface instance.
 */
class ServiceNodeInterface {

  /**
   * Constructs a service node interface instance.
   * @param {string} user - service node user
   * @param {string} password - service node password
   * @param {string} endpoint - location of service node e.g. http://localhost:41414
   */
  constructor(user, password, endpoint) {
    this._user = user;
    this._password = password;
    this._endpoint = endpoint;
  }

  async _makeServiceNodeRequest({ id = '', method, params = [] }) {
    // console.log(JSON.stringify({
    //   id, method, params
    // }));
    const { status, body } = await request
      .post(this._endpoint)
      .auth(this._user, this._password)
      .send(JSON.stringify({
        id,
        method,
        params
      }));
    let { result, error } = body;
    if (error) {
      throw new Error('Internal server error');
    }
    if (result.hasOwnProperty('error')) {
      const { code, name } = result;
      const message = result.error ? result.error : 'Internal server error';
      throw new Error(`${name} code ${code} ${message}`);
    }
    if(status !== 200)
      throw new Error(`Response code ${status}`);
    return body;
  }

  /**
   * Calls getinfo on the service node
   * @returns {Promise<Object>}
   */
  async getinfo() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'getinfo'
    });
    if(error) throw new Error(error);
    return result;
  }

  /**
   * Makes a new order.
   * @param {string} maker
   * @param {string} makerSize
   * @param {string} makerAddress
   * @param {string} taker
   * @param {string} takerSize
   * @param {string} takerAddress
   * @param {string} type
   * @returns {Promise<OrderObject>}
   */
  async dxMakeOrder(maker, makerSize, makerAddress, taker, takerSize, takerAddress, type) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxMakeOrder',
      params: [
        maker,
        makerSize,
        makerAddress,
        taker,
        takerSize,
        takerAddress,
        type
      ]
    });
    if(error) throw new Error(error);
    return Order(result);
  }

  /**
   * Takes an order.
   * @param {string} id
   * @param {string} send
   * @param {string} sendAddress
   * @param {string} receive
   * @param {string} receiveAddress
   * @returns {Promise<OrderObject>}
   */
  async dxTakeOrder(id, sendAddress, receiveAddress) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxTakeOrder',
      params: [
        id,
        sendAddress,
        receiveAddress
      ]
    });
    if(error) throw new Error(error);
    return Order(result);
  }

  /**
   * Cancels and order.
   * @param {string} id
   * @returns {Promise<OrderObject>}
   */
  async dxCancelOrder(id) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxCancelOrder',
      params: [
        id
      ]
    });
    if(error) throw new Error(error);
    return Order(result);
  }

  /**
   * Gets an order's details.
   * @param {string} id
   * @returns {Promise<OrderObject>}
   */
  async dxGetOrder(id) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrder',
      params: [
        id
      ]
    });
    if(error) throw new Error(error);
    return Order(result);
  }

  /**
   * Gets a list of orders.
   * @returns {Promise<OrderObject[]>}
   */
  async dxGetOrders() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrders'
    });
    if(error) throw new Error(error);
    return result
      .map(Order);
  }

  /**
   * Gets a list of orders made by the user.
   * @returns {Promise<OrderObject[]>}
   */
  async dxGetMyOrders() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetMyOrders'
    });
    if(error) throw new Error(error);
    return result
      .map(Order);
  }

  /**
   * Gets the order book.
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<OrderBookObject1>}
   */
  async dxGetOrderBook1(maker, taker, maxOrders = 50) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        1,
        maker,
        taker,
        maxOrders
      ]
    });
    if(error) throw new Error(error);
    return OrderBook1(result);
  }

  /**
   * Gets the order book.
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<OrderBookObject1>}
   */
  async dxGetOrderBook2(maker, taker, maxOrders = 50) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        2,
        maker,
        taker,
        maxOrders
      ]
    });
    if(error) throw new Error(error);
    return OrderBook1(result);
  }

  /**
   * Gets the order book.
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<OrderBookObject3>}
   */
  async dxGetOrderBook3(maker, taker, maxOrders = 50) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        3,
        maker,
        taker,
        maxOrders
      ]
    });
    if(error) throw new Error(error);
    return OrderBook3(result);
  }

  /**
   * Gets the order book.
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<OrderBookObject4>}
   */
  async dxGetOrderBook4(maker, taker, maxOrders = 50) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        4,
        maker,
        taker,
        maxOrders
      ]
    });
    if(error) throw new Error(error);
    return OrderBook4(result);
  }

  /**
   * Gets all recent trades by trade pair.
   * @param {string} maker
   * @param {string} taker
   * @param {boolean} [combined = true]
   * @returns {Promise<TradeObject[]>}
   */
  async dxGetOrderFills(maker, taker, combined) {
    if(combined !== false) combined = true;
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderFills',
      params: [
        maker,
        taker,
        combined
      ]
    });
    if(error) throw new Error(error);
    return result.map(Trade);
  }

  /**
   * Gets all recent trades by trade pair that have been filled within the specified time range.
   * @param {string} maker
   * @param {string} taker
   * @param {number} startTime - unix time
   * @param {number} endTime - unix time
   * @param {number} granularity - Time slice in seconds: 60, 300, 900, 3600, 21600, 86400
   * @param {boolean} [orderIds = false]
   * @returns {Promise<OrderHistoryObject[]>}
   */
  async dxGetOrderHistory(maker, taker, startTime, endTime, granularity, orderIds = false) {
    const { error, result = [] } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderHistory',
      params: [
        maker,
        taker,
        Math.floor(startTime/1000), // convert to unix time seconds
        Math.floor(endTime/1000), // convert to unix time seconds
        granularity,
        orderIds
      ]
    });
    if(error) throw new Error(error);
    if (result && result.length > 0)
      return result.map(OrderHistory);
    else return [];
  }

  /**
   * Gets tokens supported by the local client.
   * @returns {Promise<string[]>}
   */
  async dxGetLocalTokens() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetLocalTokens'
    });
    if(error) throw new Error(error);
    return result;
  }

  /**
   * Gets tokens supported by the network.
   * @returns {Promise<string[]>}
   */
  async dxGetNetworkTokens() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetNetworkTokens'
    });
    if(error) throw new Error(error);
    return result;
  }

  /**
   * Gets wallet balances
   * @returns {Promise<{coin: string, amount: string}[]>}
   */
  async dxGetTokenBalances() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetTokenBalances'
    });
    if(error) throw new Error(error);
    return Object.keys(result)
      .map(coin => ({
        coin,
        amount: result[coin]
      }));
  }

}

module.exports = ServiceNodeInterface;
