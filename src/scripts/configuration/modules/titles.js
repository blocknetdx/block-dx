/* global Localize */

module.exports = {
  CONFIGURATION_SETUP: () => Localize.text('Configuration Setup', 'configurationMenu').toUpperCase(),
  RPC_SETTINGS: () => Localize.text('RPC Settings', 'configurationMenu').toUpperCase(),
  FRESH_SETUP: () => Localize.text('Fresh Setup', 'configurationMenu').toUpperCase(),
  FRESH_SETUP_QUICK_CONFIGURATION: () => Localize.text('Fresh Setup - Quick Configuration Setup', 'configurationMenu').toUpperCase(),
  FRESH_SETUP_EXPERT_CONFIGURATION: () => Localize.text('Fresh Setup - Expert Configuration Setup', 'configurationMenu').toUpperCase(),
  ADD_WALLET: () => Localize.text('Add Wallet', 'configurationMenu').toUpperCase(),
  ADD_WALLET_QUICK_CONFIGURATION: () => Localize.text('Add Wallet - Quick Configuration Setup', 'configurationMenu').toUpperCase(),
  ADD_WALLET_EXPERT_CONFIGURATION: () => Localize.text('Add Wallet - Expert Configuration Setup', 'configurationMenu').toUpperCase(),
  UPDATE_WALLET: () => Localize.text('Update Wallet', 'configurationMenu').toUpperCase(),
  UPDATE_WALLET_QUICK_CONFIGURATION: () => Localize.text('Update Wallet - Quick Configuration Setup', 'configurationMenu').toUpperCase(),
  UPDATE_WALLET_EXPERT_CONFIGURATION: () => Localize.text('Update Wallet - Expert Configuration Setup', 'configurationMenu').toUpperCase()
};
