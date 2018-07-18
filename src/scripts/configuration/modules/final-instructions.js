const renderFinalInstructions = () => {
  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;">Before Block DX can be used, these last few steps must be completed:</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;"><strong style="margin-right: 10px;">1)</strong> Open the wallets of any tokens to be traded. If any are already open, you will need to restart them in order to activate the new configurations. Make sure that the wallets have been encrypted (Settings > Encrypt) and are unlocked (Settings > Unlock Wallet).</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;"><strong style="margin-right: 10px;">2)</strong> Open the <a href="#" class="blocknet-link js-blocknetWalletLink">Blocknet wallet</a>. If it is already open, you will need to restart it in order to activate the new configurations. Make sure that the wallet has been encrypted (Settings > Encrypt) and is unlocked (Settings > Unlock Wallet).</p>
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:5px;"><strong style="margin-right: 10px;">3)</strong> Select 'Restart' to restart Block DX and begin trading.</p>
          <div class="main-area" style="background-color:#0e2742;overflow-y:auto;"></div>
          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">CLOSE</button>
            <button id="js-continueBtn" type="button">RESTART</button>
          </div>
        `;
  return html;
};

module.exports = renderFinalInstructions;
