const renderConfiguration2 = ({ wallets }) => {

  const items = wallets
    .map(w => {
      return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                </div>
                <div class="input-group" style="margin-bottom:0;margin-top:10px;">
                  <label style="flex-basis:0;flex-grow:1;">Wallet Version</label>
                  <div class="js-versionDropdownButton dropdown-button" data-abbr="${w.abbr}" style="flex-basis:0;flex-grow:1;">
                    <div style="margin-left:10px;">${w.version}</div>
                    <div><i class="fas fa-angle-down radio-icon" style="margin-right:0;font-size:20px;"></i></div>
                  </div>
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
    })
    .join('\n');

  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;">Please select the version of the wallet installed for each of the following blockchains. DO NOT use any wallet versions not listed here. They have either not been tested yet or are not compatible.</p>
          <div id="js-mainConfigurationArea" class="main-area">
            ${items}
          </div>
          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">BACK</button>
            <button id="js-continueBtn" type="button">CONTINUE</button>
          </div>
        `;
  return html;
};

module.exports = renderConfiguration2;
