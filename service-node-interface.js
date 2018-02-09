const request = require('superagent');

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
    const body = await this._makeServiceNodeRequest({
      method: 'getinfo'
    });
    return body;
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
   * @returns {Promise<Object>}
   */
  async dxMakeOrder(maker, makerSize, makerAddress, taker, takerSize, takerAddress, type) {
    const body = await this._makeServiceNodeRequest({
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
    return body;
  }

  /**
   * Takes an order.
   * @param {string} id
   * @param {string} send
   * @param {string} sendAddress
   * @param {string} receive
   * @param {string} receiveAddress
   * @returns {Promise<Object>}
   */
  async dxTakeOrder(id, send, sendAddress, receive, receiveAddress) {
    const body = await this._makeServiceNodeRequest({
      method: 'dxAcceptTransaction',
      params: [
        id,
        send,
        sendAddress,
        receive,
        receiveAddress
      ]
    });
    return body;
  }

  /**
   * Cancels and order.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async dxCancelOrder(id) {
    const body = await this._makeServiceNodeRequest({
      method: 'dxCancelTransaction',
      params: [
        id
      ]
    });
    return body;
  }

  /**
   * Gets an order's details.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async dxGetOrder(id) {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetTransactionInfo',
      params: [
        id
      ]
    });
    return body;
  }

  /**
   * Gets a list of orders.
   * @returns {Promise<Object[]>}
   */
  async dxGetOrders() {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetTransactions'
    });
    return body;
  }

  /**
   * Gets a list of orders made by the user.
   * @returns {Promise<Object[]>}
   */
  async dxGetMyOrders() {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetMyOrders'
    });
    return body;
  }

  /**
   * Gets the order book.
   * @param {number} detail - 1, 2, 3, 4
   * @param {string} maker
   * @param {string} taker
   * @param {number} [maxOrders = 50]
   * @returns {Promise<Object>}
   */
  async dxGetOrderBook(detail, maker, taker, maxOrders = 50) {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetOrderBook',
      params: [
        detail,
        maker,
        taker,
        maxOrders
      ]
    });
    return body;
  }

  /**
   * Gets all recent trades by trade pair.
   * @param {string} maker
   * @param {string} taker
   * @param {boolean} [combined = true]
   * @returns {Promise<Object[]>}
   */
  async dxGetOrderFills(maker, taker, combined) {
    if(combined !== false) combined = true;
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetTransactionsHistory',
      params: [
        maker,
        taker,
        combined
      ]
    });
    return body;
  }

  /**
   * Gets all recent trades by trade pair that have been filled within the specified time range.
   * @param {string} maker
   * @param {string} taker
   * @param {number} startTime - unix time
   * @param {number} endTime - unix time
   * @param {number} granularity - Time slice in seconds: 30, 60, 300, 900, 3600, 21600, 86400
   * @param {String[]} [orderIds = []]}
   * @returns {Promise<Object[]>}
   */
  async dxGetOrderHistory(maker, taker, startTime, endTime, granularity, orderIds = []) {
    const body = await this._makeServiceNodeRequest({
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
    return body;
  }

  /**
   * Gets tokens supported by the local client.
   * @returns {Promise<string[]>}
   */
  async dxGetLocalTokens() {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetCurrencies'
    });
    return body;
  }

  /**
   * Gets tokens supported by the network.
   * @returns {Promise<string[]>}
   */
  async dxGetNetworkTokens() {
    const body = await this._makeServiceNodeRequest({
      method: 'dxGetNetworkTokens'
    });
    return body;
  }

}

module.exports = ServiceNodeInterface;
