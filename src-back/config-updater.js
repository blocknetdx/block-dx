const path = require('path');
const fs = require('fs-extra-promise');
const electron = require('electron');
const { blocknetDir3, blocknetDir4, BLOCKNET_CONF_NAME3, BLOCKNET_CONF_NAME4, X_BRIDGE_CONF_NAME } = require('./constants');

const { platform } = process;

const clearBlockdxData = async function(storage) {
  const storageKeysToClear = [
    'addresses',
    'port',
    'blocknetIP',
    'tokenPaths',
    'user',
    'password',
    'selectedWallets',
    'keyPair',
    'xbridgeConfPath'
  ];
  storage.removeItems(storageKeysToClear, true);
};

module.exports.checkAndCopyV3Configs = async function(basePath, app, Localize, storage) {
  const v3DirPath = path.join(basePath, blocknetDir3[platform]);
  const v3XbridgeConfPath = path.join(v3DirPath, X_BRIDGE_CONF_NAME);
  const v3BlocknetConfPath = path.join(v3DirPath, BLOCKNET_CONF_NAME3);
  const v4DirPath = path.join(basePath, blocknetDir4[platform]);
  const v4XbridgeConfPath = path.join(v4DirPath, X_BRIDGE_CONF_NAME);
  const v4BlocknetConfPath = path.join(v4DirPath, BLOCKNET_CONF_NAME4);
  const v3DirExists = await fs.existsAsync(v3DirPath);
  const v4DirExists = await fs.existsAsync(v4DirPath);
  if(v3DirExists && v4DirExists) {
    const v3XbridgeConfExists = await fs.existsAsync(v3XbridgeConfPath);
    const v3BlocknetConfExists = await fs.existsAsync(v3BlocknetConfPath);
    if(v3XbridgeConfExists && v3BlocknetConfExists) {
      await fs.copyAsync(v3XbridgeConfPath, v4XbridgeConfPath);
      await fs.copyAsync(v3BlocknetConfPath, v4BlocknetConfPath);
      storage.removeItem('addresses', true);
      storage.setItem('xbridgeConfPath', v4XbridgeConfPath, true);
      await electron.dialog.showMessageBox({
        type: 'info',
        title: Localize.text('Blocknet Configs Updated', 'universal'),
        message: Localize.text('The configuration files for your new Blocknet wallet have been updated. In order for Block DX to connect to the RPC server, you will need to restart your Blocknet wallet and then re-open Block DX.', 'universal'),
        buttons: [
          Localize.text('OK', 'universal')
        ]
      });
      app.quit();
    } else {
      clearBlockdxData(storage);
    }
  } else {
    clearBlockdxData(storage);
  }
};
