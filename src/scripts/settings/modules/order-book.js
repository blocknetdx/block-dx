const { dropdown } = require('./shared');

const allOrdersOption = ({ state, Localize }) => {
  const showAllOrders = state.get('showAllOrders');
  const xBridgeConfExists = state.get('xBridgeConfExists');
  return `
    <div class="option-container">
      <p class="option-title">${Localize.text('Show All Orders', 'generalSettingsWindow')}</p>
      <p class="option-description">${Localize.text('This setting enables you to view all orders across the network instead of just the markets you have connected wallets for. This may result in the Blocknet wallet utilizing more resources.', 'generalSettingsWindow')}</p>
      ${!xBridgeConfExists ? '<p class="error-text"><em>NOTE: There is a problem with your XBridge settings. This feature is disabled.</em></p>' : ''}
      ${dropdown({ id: xBridgeConfExists ? 'js-showAllOrdersDropdown' : '', label: Localize.text('Show All Orders?', 'generalSettingsWindow'), value: showAllOrders ? Localize.text('Yes', 'universal') : Localize.text('No', 'universal') })}
    </div>
  `;
};

const renderOrderFormSettings = ({ state, Localize }) => {
  const html = `
    <div id="js-mainConfigurationArea" class="main-area">
      ${allOrdersOption({ state, Localize })}
    </div>
  `;
  return html;
};

module.exports = renderOrderFormSettings;
