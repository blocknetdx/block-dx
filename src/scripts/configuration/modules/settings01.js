const renderSettings1 = ({ state }) => {
  const generateCredentials = state.get('generateCredentials');
  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Usernames and passwords must be created for the wallets of each of the tokens that will be traded.</p>
          <div class="main-area" style="background-color:#0e2742;overflow-y:auto;">
            <div id="js-automaticCredentials" class="main-area-item"><i class="${generateCredentials ? 'fa' : 'far'} fa-circle radio-icon"></i> Automatically generate credentials</div>
            <div id="js-manualCredentials" class="main-area-item"><i class="${!generateCredentials ? 'fa' : 'far'} fa-circle radio-icon"></i> Create RPC credentials manually (not recommended)</div>
          </div>
          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">BACK</button>
            <button id="js-continueBtn" type="button">CONTINUE</button>
          </div>
        `;
  return html;
};

module.exports = renderSettings1;
