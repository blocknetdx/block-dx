const { dropdown } = require('./shared');

const addressesOption = ({ state, Localize }) => {
  const autofillAddresses = state.get('autofillAddresses');
  const autoGenerateAddressesAvailable = state.get('autoGenerateAddressesAvailable');
  return `
    <div class="option-container">
      <p class="option-title">${Localize.text('Addresses', 'generalSettingsWindow')}</p>
      <p class="option-description"><em>${Localize.text('Note: This feature require Blocknet version 3.14.1 or higher.', 'generalSettingsWindow')}</em></p>
      ${dropdown({ id: autoGenerateAddressesAvailable ? 'js-autofillAddressesDropdown' : '', label: Localize.text('Autofill Addresses', 'generalSettingsWindow'), value: autofillAddresses ? Localize.text('Yes', 'universal') : Localize.text('No', 'universal') })}
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
