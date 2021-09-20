const blocknetDir4 = {
  win32: 'Blocknet',
  darwin: 'Blocknet',
  linux: 'blocknet'
};

const blocknetDir3 = {
  win32: 'BlocknetDX',
  darwin: 'BlocknetDX',
  linux: 'blocknetdx'
};

const X_BRIDGE_CONF_NAME = 'xbridge.conf';
const BLOCKNET_CONF_NAME4 = 'blocknet.conf';
const BLOCKNET_CONF_NAME3 = 'blocknetdx.conf';

const ipcMainListeners = {
  GET_HIDE_REFUND_NOTIFICATION: 'GET_HIDE_REFUND_NOTIFICATION',
  OPEN_REFUND_NOTIFICATION: 'OPEN_REFUND_NOTIFICATION',
  GET_MESSAGE_BOX_TITLE: 'GET_MESSAGE_BOX_TITLE',
  GET_MESSAGE_BOX_MESSAGE: 'GET_MESSAGE_BOX_MESSAGE',
  SET_MESSAGE_BOX_NOT_SHOW_AGAIN: 'SET_MESSAGE_BOX_NOT_SHOW_AGAIN',
  CLOSE_MESSAGE_BOX: 'CLOSE_MESSAGE_BOX'
};

const pricingSources = {
  CLOUD_CHAINS: 'CLOUD_CHAINS',
  CRYPTO_COMPARE: 'CRYPTO_COMPARE',
  COIN_MARKET_CAP: 'COIN_MARKET_CAP',
};

module.exports = {
  blocknetDir4,
  blocknetDir3,
  X_BRIDGE_CONF_NAME,
  BLOCKNET_CONF_NAME4,
  BLOCKNET_CONF_NAME3,
  ipcMainListeners,
  pricingSources,
};
