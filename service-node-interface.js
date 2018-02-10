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
  time: data[0] || '',
  low: data[1] || 0,
  high: data[2] || 0,
  open: data[3] || 0,
  close: data[4] || 0,
  volume: data[5] || 0
});

/**
 * @typedef {Object} OrderBookObject
 * @property {number} detail
 * @property {string} maker
 * @property {string} taker
 * @property {Array[]} bids
 * @property {Array[]} asks
 */

/**
 *
 * @param {Object} data
 * @returns {OrderBookObject}
 * @constructor
 */
const OrderBook = data => ({
  detail: data.detail || 0,
  maker: data.maker || '',
  taker: data.taker || '',
  bids: data.bids || [],
  asks: data.asks || []
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
    const { status, body } = await request
      .post(this._endpoint)
      .auth(this._user, this._password)
      .send(JSON.stringify({
        id,
        method,
        params
      }));
    if(status !== 200) throw new Error(`Respose code ${status}`);
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
      method: 'dxCreateTransaction',
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
  async dxTakeOrder(id, send, sendAddress, receive, receiveAddress) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxAcceptTransaction',
      params: [
        id,
        send,
        sendAddress,
        receive,
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
      method: 'dxCancelTransaction',
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
      method: 'dxGetTransactions'
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
   * @param {number} detail - 1, 2, 3, 4
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<OrderObject>}
   */
  async dxGetOrderBook(detail, maker, taker, maxOrders = 50) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        detail,
        maker,
        taker,
        maxOrders
      ]
    });
    if(error) throw new Error(error);
    return OrderBook(result);
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
   * @param {number} granularity - Time slice in seconds: 30, 60, 300, 900, 3600, 21600, 86400
   * @param {String[]} [orderIds = []]
   * @returns {Promise<OrderHistoryObject[]>}
   */
  async dxGetOrderHistory(maker, taker, startTime, endTime, granularity, orderIds = []) {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetTradeHistory',
      params: [
        maker,
        taker,
        startTime,
        endTime,
        granularity,
        orderIds
      ]
    });
    if(error) throw new Error(error);
    return result
      .map(OrderHistory);
  }

  /**
   * Gets tokens supported by the local client.
   * @returns {Promise<string[]>}
   */
  async dxGetLocalTokens() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'dxGetCurrencies'
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

}

module.exports = ServiceNodeInterface;
