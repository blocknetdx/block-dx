const renderConfiguration3 = ({ state }) => {
  const allWallets = state.get('wallets');
  const selectedWallets = state.get('selectedWallets');
  const wallets = allWallets
    .filter(w => selectedWallets.has(w.abbr));
  const items = wallets
    .map(w => {
      return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                  <div id="${w.abbr}-error" class="text-danger" style="display:${w.error || !w.directory ? 'block' : 'none'};text-align:right;">Error: data directory not found</div>
                </div>
                <div style="margin-top:10px;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;">
                  <input id="${w.abbr}" type="text" value="${w.directory}" readonly />
                  <button class="js-browseBtn" type="button" data-abbr="${w.abbr}" style="margin-top:0;margin-right:0;width:100px;min-width:100px;">BROWSE</button>
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
    })
    .join('\n');
  const missingDirectories = wallets
    .reduce((num, w) => {
      return (!w.error && w.directory) ? num : num + 1;
    }, 0);

  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Please review the locations of each wallet's data directory.</p>
          <p id="js-errors" class="text-danger" style="display:${missingDirectories > 0 ? 'block' : 'none'};margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;"><span id="js-errorCount">${missingDirectories}</span> error(s) exist; continue to skip wallets with errors.</p>
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

module.exports = renderConfiguration3;
