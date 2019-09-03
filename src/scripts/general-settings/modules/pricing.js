const { dropdown } = require('./shared');

const textInput = ({ id, label, value }) => {
  return `
    <div class="input-group" style="margin-bottom:0;margin-top:10px;">
      <label>${label}</label>
      <input ${id ? `id="${id}"` : ''} class="inputError" type="text" value="${value}" placeholder="Enter API key" />
    </div>
  `;
};

const numberInput = ({ id, label, value, min = 0, step = 1 }) => {
  return `
    <div class="input-group" style="margin-bottom:0;margin-top:10px;">
      <label>${label}</label>
      <input ${id ? `id="${id}"` : ''} type="number" style="padding-right: 54px;" value="${value}" min="${min}" step="${step}" />
    </div>
  `;
};

const colorToggle = ({ enabled }) => {
  return `
    <div class="js-pricingColorToggle color-toggle-container">
      <a href="#" class="js-pricingToggle1 pricingToggle1 ${enabled ? 'active' : ''}">ENABLED</a>
      <a href="#" class="js-pricingToggle2 pricingToggle2 ${!enabled ? 'active' : ''}">DISABLED</a>
      <div class="js-pricingColorBar color-bar color-bar-${enabled ? 'left' : 'right'}"></div>
    </div>
  `;
};

const renderPricing = ({ state }) => {
  const pricingSource = state.get('pricingSource');
  const pricingSources = state.get('pricingSources');
  const pricingSourceObj = pricingSources.find(p => p.id === pricingSource) || {};
  const pricingSourceText = pricingSourceObj.text;
  const apiKeys = state.get('apiKeys');
  const html = `
    <div id="js-mainConfigurationArea" class="main-area">
      <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:0px;">Allows orders to be viewed and placed in BTC for any market pair. This feature is limited by the pricing data available from each API source. The selected API source must have BTC pricing for the selected market. An API key may be required from the source to access their pricing data. When selecting the pricing update frequency, keep in mind the API rate-limit if applicable.</p>
      <p id="js-pricingInputError" class="pricingErrorMessage" style="text-align:left;">&nbsp;</p>
      ${dropdown({ id: 'js-pricingUnitDropdown', label: 'Pricing Unit', value: state.get('pricingUnit') })}
      ${dropdown({ id: 'js-pricingSourceDropdown', label: 'Price Source', value: pricingSourceText })}
      ${textInput({  id: 'js-apiKeyInput', label: 'API Key', value: apiKeys[pricingSource] ? apiKeys[pricingSource] : '' })}
      ${numberInput({ id: 'js-updateFrequencyInput', label: 'Update Frequency (seconds)', value: state.get('pricingFrequency') / 1000, min: 0, step: 1 })}
      <div style="height:9px;"></div>
    </div>
      ${colorToggle({ enabled: state.get('pricingEnabled') })}
  `;
  return html;
};

module.exports = renderPricing;
