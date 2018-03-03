/* global describe, it */
require('should');
const ServiceNodeInterface = require('../src-back/service-node-interface');

describe('Service Node Interface', () => {

  const sn = new ServiceNodeInterface('myuser', 'mypassword', 'http://localhost:41414');

  it('Should be a constructor', () => {
    ServiceNodeInterface.should.be.a.Function();
  });

  it('Should construct a service node interface instance', () => {
    sn.should.be.an.instanceof(ServiceNodeInterface);
  });

  describe('Service Node Interface Instance', () => {

    let orderId, orderToTake, myOrders;

    describe('getinfo method', () => {
      it('should get info from the service node', async function() {
        const res = await sn.getinfo();
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrderBook1 method', () => {
      it('should get the order book at level 1', async function() {
        const res = await sn.dxGetOrderBook1('SYS', 'LTC', 50);
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrderBook2 method', () => {
      it('should get the order book at level 2', async function() {
        const res = await sn.dxGetOrderBook2('SYS', 'LTC', 50);
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrderBook3 method', () => {
      it('should get the order book at level 3', async function() {
        const res = await sn.dxGetOrderBook3('SYS', 'LTC', 50);
        orderId = res.bids[0].orderId;
        orderToTake = Object.assign({}, {maker: res.maker, taker: res.taker }, res.bids[0]);
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrderBook4 method', () => {
      it('should get the order book at level 4', async function() {
        const res = await sn.dxGetOrderBook4('SYS', 'LTC', 50);
        res.should.be.an.Object();
      });
    });

    describe('dxGetOrder method', () => {
      it('should get order details', async function() {
        const order = await sn.dxGetOrder(orderId);
        order.should.be.an.Object();
        order.id.should.equal(orderId);
      });
    });

    describe('dxGetOrders method', () => {
      it('should get a list of order details', async function() {
        const orders = await sn.dxGetOrders();
        orders.should.be.an.Array();
        orders.some(o => o.id === orderId).should.be.True();
      });
    });

    describe('dxGetMyOrders method', () => {
      it('should get a list of the user\'s orders', async function() {
        myOrders = await sn.dxGetMyOrders();
        myOrders.should.be.an.Array();
      });
    });

    describe('dxGetOrderFills method', () => {
      it('should get a list of recent trades', async function() {
        const orders = await sn.dxGetOrderFills('SYS', 'LTC');
        console.log(orders);
        orders.should.be.an.Array();
      });
    });

    describe('dxGetOrderHistory method', () => {
      it('should get a list of recently trades which have been filled', async function() {
        const orders = await sn.dxGetOrderHistory('SYS', 'LTC', new Date().getTime('January 1, 1995 00:00:00'), new Date().getTime(), 60);
        orders.should.be.an.Array();
      });
    });

    describe('dxMakeOrder method', () => {
      it('should make a new order', async function() {
        const { maker, makerSize, makerAddress, taker, takerSize, takerAddress } = myOrders[0];
        const order = await sn.dxMakeOrder(maker, makerSize, makerAddress, taker, takerSize, takerAddress, 'exact');
        order.should.be.an.Object();
      });
    });

    describe('dxTakeOrder method', () => {
      it('should take an order', async function() {
        const { maker, taker } = orderToTake;
        const res = await sn.dxTakeOrder(orderId, taker, '12345', maker, '54321');
        res.should.be.an.Object();
      });
    });

    describe('dxCancelOrder method', () => {
      it('should cancel an order', async function() {
        const { id } = myOrders.find(o => o.status === 'open');
        const res = await sn.dxCancelOrder(id);
        res.should.be.an.Object();
      });
    });

    describe('dxGetLocalTokens method', () => {
      it('should get tokens supported by the local system', async function() {
        const tokens = await sn.dxGetLocalTokens();
        tokens.should.be.an.Array();
      });
    });

    describe('dxGetNetworkTokens method', () => {
      it('should get tokens supported by the network', async function() {
        const tokens = await sn.dxGetNetworkTokens();
        tokens.should.be.an.Array();
      });
    });

  });

});
