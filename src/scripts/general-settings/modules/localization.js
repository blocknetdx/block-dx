const { dropdown } = require('./shared');

const showLocaleOption = ({ state, Localize }) => {
  const locale = state.get('locale');
  const locales = state.get('locales');
  let [ code, name ] = locales.find(l => l[0] === locale) || [];
  if(!code) {
    const enLocale = locales.find(l => l[0] === 'en');
    code = enLocale[0];
    name = enLocale[1];
  }
  return `
    <div class="option-container">
      <p class="option-title"></p>
      <p class="option-description">${Localize.text('This will change the language of the Block DX application. Please select one of the available locales.', 'generalSettingsWindow')}</p>
      ${dropdown({ id: 'js-selectLocaleDropdown', label: Localize.text('Select App Locale', 'generalSettingsWindow'), value: code + ' - ' + name })}
    </div>
  `;
};

const renderLocalization = ({ state, Localize }) => {
  const html = `
    <div id="js-mainConfigurationArea" class="main-area">
      ${showLocaleOption({ state, Localize })}
    </div>
  `;
  return html;
};

module.exports = renderLocalization;
