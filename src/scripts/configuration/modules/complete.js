const renderComplete = () => {
  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Please follow these last few steps to use Block DX:</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">- Open and unlock the wallets of any coins to be traded</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">- Restart and unlock the Blocknet wallet</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">- Select 'Finish' to restart Block DX and begin trading</p>
          <div class="main-area" style="background-color:#0e2742;overflow-y:auto;"></div>
          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">BACK</button>
            <button id="js-continueBtn" type="button">FINISH</button>
          </div>
        `;
  return html;
};

module.exports = renderComplete;
