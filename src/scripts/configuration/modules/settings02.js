const renderSettings2 = ({ wallets }) => {
  const items = wallets
    .map(w => {
      return `
              <div class="main-area-item2">
                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${w.name}</div>
                  <div id="${w.abbr}-error" class="text-danger" style="display:none;text-align:right;">Error: data directory not found</div>
                </div>
                <div style="margin-top:10px;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;">
                  <input class="js-usernameInput" data-abbr="${w.abbr}" type="text" style="margin-right:10px;" value="${w.username}" placeholder="RPC username" />
                  <input class="js-passwordInput" data-abbr="${w.abbr}" type="text" value="${w.password}" placeholder="RPC password" />
                  <!--<button class="js-saveBtn" type="button" data-abbr="${w.abbr}" style="margin-top:0;margin-right:0;width:100px;min-width:100px;">SAVE</button>-->
                </div>
              </div>
              <div style="height:1px;"></div>
            `;
    })
    .join('\n');

  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Please set the RPC username and password for each wallet.</p>
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

module.exports = renderSettings2;
