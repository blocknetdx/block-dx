const request = require('superagent');
const _ = require('lodash');
const { Localize } = require('./localize');
const { logger } = require('./logger');

// Errors
const ErrorMsg = (name, code) => {
  if (Errors[name] && Errors[name][code])
    return Errors[name][code]();
  else return '';
};

const Errors = {};
Errors['dxMakeOrder'] = {};
Errors['dxTakeOrder'] = {};
Errors['dxCancelOrder'] = {};
Errors['dxGetOrder'] = {};
Errors['dxGetOrders'] = {};
Errors['dxGetMyOrders'] = {};
Errors['dxGetOrderBook'] = {};
Errors['dxGetOrderHistory'] = {};
Errors['dxGetOrderFills'] = {};
Errors['dxGetLocalTokens'] = {};
Errors['dxGetNetworkTokens'] = {};
Errors['dxGetTokenBalances'] = {};
Errors['dxFlushCancelledOrders'] = {};
Errors['dxLoadXBridgeConf'] = {};
Errors['dxGetLockedUtxos'] = {};

// Full error code list found here:
// https://github.com/BlocknetDX/BlockDX/blob/master/src/xbridge/util/xbridgeerror.h

// Messages: Errors['dxGetOrderHistory'][1025] = 'Message here';

// dxMakeOrder
Errors['dxMakeOrder'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxMakeOrder'][1018] = () => Localize.text('Unable to connect to wallet. Please make sure the Blocknet wallet and the wallets of the assets being traded are open, synced, and unlocked.', 'rpcError');
Errors['dxMakeOrder'][1019] = () => Localize.text('Unable to create order due to insufficient funds. Please make sure there are enough *available* funds (UTXOS/inputs) of the asset being sold to cover the order amount. Funds (UTXOS/inputs) may be tied up/reserved by other orders.', 'rpcError');
Errors['dxMakeOrder'][1020] = () => Localize.text('Unable to create order due to unsigned transaction. Please try again or use a different address.', 'rpcError');
Errors['dxMakeOrder'][1026] = () => Localize.text('Unable to create order. Please make sure a valid address is being used and the wallets of the assets being traded are open, synced, and unlocked.', 'rpcError');
Errors['dxMakeOrder'][1027] = () => Localize.text('Unable to create order due to invalid transaction signature.', 'rpcError');
Errors['dxMakeOrder'][1030] = () => Localize.text('Unable to create order due to the trade amount being too small (dust value). Please increase the order size and try again.', 'rpcError');
Errors['dxMakeOrder'][1032] = () => Localize.text('Unable to create order. Either the Blocknet wallet is still loading network data (takes a few minutes after syncing completes) or no nodes on the network are currently supporting this trade pair.', 'rpcError');

// dxTakeOrder
Errors['dxTakeOrder'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxTakeOrder'][1018] = () => Localize.text('Unable to connect to wallet. Please make sure the Blocknet wallet and the wallets of the assets being traded are open, synced, and unlocked.', 'rpcError');
Errors['dxTakeOrder'][1019] = () => Localize.text('Unable to take order due to insufficient funds. Please make sure there are enough *available* funds (UTXOS/inputs) of the asset being sold to cover the order amount. Funds (UTXOS/inputs) may be tied up/reserved by other orders.', 'rpcError');
Errors['dxTakeOrder'][1020] = () => Localize.text('Unable to take order due to unsigned transaction. Please try again or use a different address.', 'rpcError');
Errors['dxTakeOrder'][1021] = () => Localize.text('Unable to take order. Please make sure the order ID is valid.', 'rpcError');
Errors['dxTakeOrder'][1026] = () => Localize.text('Unable to take order. Please make sure a valid address is being used and the wallets of the assets being traded are open, synced, and unlocked.', 'rpcError');
Errors['dxTakeOrder'][1027] = () => Localize.text('Unable to take order due to invalid transaction signature. Please try again or use a different address.', 'rpcError');
Errors['dxTakeOrder'][1031] = () => Localize.text('Unable to take order due to insufficient funds. Please make sure there are enough *available* BLOCK UTXOS/inputs to cover the fee amount.', 'rpcError');

// dxCancelOrder
Errors['dxCancelOrder'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxCancelOrder'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxCancelOrder'][1021] = () => Localize.text('Unable to cancel order. Please make sure the order ID is valid.', 'rpcError');
Errors['dxCancelOrder'][1028] = () => Localize.text('Unable to cancel order due to invalid order state. Order may already be cancelled or in another terminal state.', 'rpcError');

// dxGetOrder
Errors['dxGetOrder'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrder'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrder'][1021] = () => Localize.text('Unable to find order. Please make sure the order ID is valid.', 'rpcError');

// dxGetOrders
Errors['dxGetOrders'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrders'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetMyOrders
Errors['dxGetMyOrders'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetMyOrders'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetOrderBook
Errors['dxGetOrderBook'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrderBook'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetOrderHistory
Errors['dxGetOrderHistory'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrderHistory'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetOrderFills
Errors['dxGetOrderFills'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetOrderFills'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetLocalTokens
Errors['dxGetLocalTokens'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetLocalTokens'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetNetworkTokens
Errors['dxGetNetworkTokens'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetNetworkTokens'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetTokenBalances
Errors['dxGetTokenBalances'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetTokenBalances'][1018] = () => Localize.text('Unable to connect to wallet. Please make sure the Blocknet wallet and the wallets of the assets being traded are open, synced, and unlocked.', 'rpcError');

// dxFlushCancelledOrders
Errors['dxFlushCancelledOrders'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxFlushCancelledOrders'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxLoadXBridgeConf
Errors['dxLoadXBridgeConf'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxLoadXBridgeConf'][1018] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');

// dxGetLockedUtxos
Errors['dxGetLockedUtxos'][1002] = () => Localize.text('Unable to connect to the Blocknet wallet. Please make sure the wallet is open, synced, and unlocked.', 'rpcError');
Errors['dxGetLockedUtxos'][1021] = () => Localize.text('Unable to find order. Please make sure the order ID is valid.', 'rpcError');












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
const kServiceNodeInterfaceMaxRequests = 10;
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
    this._requests_in_progress = new Map();
    this._requests_in_progress_queue = [];
    this._requestPoll();
  }

  // Periodically handle requests
  _requestPoll() {
    setTimeout(() => {
      if (this._requests_in_progress_queue.length <= 0) {
        this._requestPoll();
        return;
      }

      for (let i = 0; i < this._requests_in_progress_queue.length; i++) {
        if (i >= kServiceNodeInterfaceMaxRequests)
          break;
        const key = this._requests_in_progress_queue[i];
        const p = this._requests_in_progress.get(key);
        setTimeout(async () => {
          try {
            const body = await this._queueRequest({ id: p.id, method: p.method, params: p.params });
            p.presolve(body);
          } catch(err) {
            p.preject(err);
          }
        }, 0);
      }

      // Remove resolved/rejected promises
      let removed;
      if (this._requests_in_progress_queue.length <= kServiceNodeInterfaceMaxRequests)
        removed = this._requests_in_progress_queue.splice(0, this._requests_in_progress_queue.length);
      else
        removed = this._requests_in_progress_queue.splice(0, kServiceNodeInterfaceMaxRequests);
      if (removed.length > 0)
        removed.forEach(k => this._requests_in_progress.delete(k));

      // Next iteration
      this._requestPoll();
    }, 50);
  }

  async _queueRequest({ id = '', method, params = [] }) {
    let status, body, res;
    try {
        res = await request
        .post(this._endpoint)
        .auth(this._user, this._password)
        .send(JSON.stringify({
            id,
            method,
            params
          }));
        status = res.status || '';
        body = res.body;
      if (_.isUndefined(body))
        throw new Error();
    } catch(err) {
      throw new Error(`Unable to connect to the Blocknet wallet.\n\nMake sure your Blocknet wallet is open, synced, and unlocked.`);
    }
    if(body.result.error) {
      const { code = 1025, name = '', error = '' } = body.result;
      if (ErrorMsg(name, code)) {
        throw new Error(`${ErrorMsg(name, code)}\n\nAPI:\t\t${name}\nCode:\t${code}\n\n${error}`);
      } else {
        throw new Error(`${error}\n\nAPI:\t\t${name}\nCode:\t${code}`);
      }
    }
    if(status !== 200)
      throw new Error(`Response code ${status}`);
    return body;
  }

  async _makeServiceNodeRequest({ id = '', method, params = [] }) {
    // Queue up requests to prevent requests from happening too often
    // The wallet endpoints typically handle 16 or fewer requests at
    // a time.
    const key = method + params.toString();
    const req = this._requests_in_progress.get(key);
    if (!_.isNull(req) && !_.isUndefined(req))
      return req.p; // req already in progress
    let presolve, preject;
    const p = new Promise((resolve, reject) => {
      presolve = resolve;
      preject = reject;
    });
    this._requests_in_progress.set(key, { id, method, params, p, presolve, preject });
    this._requests_in_progress_queue.push(key);
    return p;
  }

  /**
   * Calls getinfo on the service node
   * @returns {Promise<Object>}
   */
  async getinfo() {
    const { error, result } = await this._makeServiceNodeRequest({
      method: 'getnetworkinfo'
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
        startTime, // unix time seconds
        endTime, // unix time seconds
        granularity,
        orderIds,
        true
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

  /**
   * Reload xbridge conf without restarting wallet
   * @returns {Promise<>}
   */
  async dxLoadXBridgeConf() {
    const { error } = await this._makeServiceNodeRequest({
      method: 'dxLoadXBridgeConf'
    });
    if(error) throw new Error(error);
  }

  /**
   * Clears cancelled orders
   * @returns {Promise<void>}
   */
  async dxFlushCancelledOrders() {
    const { error } = await this._makeServiceNodeRequest({
      method: 'dxFlushCancelledOrders'
    });
    if(error) throw new Error(error);
  }

  /**
   * Generates a new token address
   * @param {string} token
   * @returns {Promise<string>}
   */
  async dxGetNewTokenAddress(token) {
    const { error, result = [] } = await this._makeServiceNodeRequest({
      method: 'dxGetNewTokenAddress',
      params: [
        token
      ]
    });
    if(error) throw new Error(error);
    return result[0] || '';
  }

}

module.exports = ServiceNodeInterface;
