const { dropdown } = require('./shared');

const addressesOption = ({ state, Localize }) => {
  const autofillAddresses = state.get('autofillAddresses');
  const autoGenerateAddressesAvailable = state.get('autoGenerateAddressesAvailable');
  return `
    <div class="option-container">
      <p class="option-title">${Localize.text('Auto Generate Addresses', 'generalSettingsWindow')}</p>
      <p class="option-description">${Localize.text('This setting automatically generates new addresses on startup for connected wallets and auto-populates the order form address fields.', 'generalSettingsWindow')}<br><br><strong><em>${Localize.text('Note: This feature requires Blocknet version 3.14.1 or higher.', 'generalSettingsWindow')}</em></strong></p>
      ${dropdown({ id: autoGenerateAddressesAvailable ? 'js-autofillAddressesDropdown' : '', label: Localize.text('Auto Generate Addresses?', 'generalSettingsWindow'), value: autofillAddresses ? Localize.text('Yes', 'universal') : Localize.text('No', 'universal') })}
    </div>
  `;
};

const renderOrderFormSettings = ({ state, Localize }) => {
  const html = `
    <div id="js-mainConfigurationArea" class="main-area">
      ${addressesOption({ state, Localize })}
    </div>
  `;
  return html;
};

module.exports = renderOrderFormSettings;
