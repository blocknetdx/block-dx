const dropdown = ({ id, label, value }) => {
  return `
      <div class="input-group" style="margin-bottom:0;margin-top:10px;">
        <label style="flex-basis:0;flex-grow:1;">${label}</label>
        <div ${id ? `id="${id}"` : ''} class="js-versionDropdownButton dropdown-button" style="flex-basis:0;flex-grow:1;">
          <div style="margin-left:10px;">${value}</div>
          <div><i class="fas fa-angle-down radio-icon" style="margin-right:0;font-size:20px;"></i></div>
        </div>
      </div>
  `;
};
const textInput = ({ id, label, value }) => {
  return `
    <div class="input-group" style="margin-bottom:0;margin-top:10px;">
      <label>${label}</label>
      <input ${id ? `id="${id}"` : ''} type="text" value="${value}" />
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
    <div class="js-colorToggle color-toggle-container">
      <a href="#" class="js-toggle1 toggle1 ${enabled ? 'active' : ''}">ENABLED</a>
      <a href="#" class="js-toggle2 toggle2 ${!enabled ? 'active' : ''}">DISABLED</a>
      <div class="js-colorBar color-bar color-bar-${enabled ? 'left' : 'right'}"></div>
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
    <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;">Allows orders to be viewed and placed in BTC for any market pair. This feature is limited by the pricing data available from each API source. The selected API source must have BTC pricing for the selected market. An API key may be required from the source to access their pricing data. When selecting the pricing update frequency, keep in mind the API rate-limit if applicable.</p>
    <div id="js-mainConfigurationArea" class="main-area" style="overflow:hidden;position:relative;background-color:inherit;">
      ${dropdown({ id: 'js-pricingUnitDropdown', label: 'Pricing Unit', value: state.get('pricingUnit') })}
      ${dropdown({ id: 'js-pricingSourceDropdown', label: 'Price Source', value: pricingSourceText })}
      ${textInput({  id: 'js-apiKeyInput', label: 'API Key', value: apiKeys[pricingSource] ? apiKeys[pricingSource] : '' })}
      ${numberInput({ id: 'js-updateFrequencyInput', label: 'Update Frequency (seconds)', value: state.get('pricingFrequency') / 1000, min: 0, step: 1 })}
      <div style="height:9px;"></div>
      ${colorToggle({ enabled: state.get('pricingEnabled') })}
    </div>
  `;
  return html;
};

module.exports = renderPricing;
