const renderSettings1 = ({ state }) => {
  const generateCredentials = state.get('generateCredentials');
  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Usernames and passwords must be created for the wallet of each token that will be traded.</p>
          <div class="main-area" style="background-color:#0e2742;overflow-y:auto;">
            <div id="js-automaticCredentials" class="main-area-item"><i class="${generateCredentials ? 'fa' : 'far'} fa-circle radio-icon"></i> Quick Setup - Automatically generate credentials (recommended)</div>
            <div id="js-manualCredentials" class="main-area-item"><i class="${!generateCredentials ? 'fa' : 'far'} fa-circle radio-icon"></i> Expert Setup - Manually create RPC credentials (advanced users only)</div>
          </div>
          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">BACK</button>
            <button id="js-continueBtn" type="button">CONTINUE</button>
          </div>
        `;
  return html;
};

module.exports = renderSettings1;
