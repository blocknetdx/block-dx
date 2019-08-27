const { dropdown } = require('./shared');

const showWalletOption = ({ state }) => {
  const showWallet = state.get('showWallet');
  return `
    <div class="option-container">
      <p class="option-title">Wallet Balance</p>
      <p class="option-description">The "Wallet" balance is the <em>total</em> balance of your Blocknet wallet. This is useful when using a separate Blocknet wallet for trading and want to see the balance of your main Blocknet wallet, which is where fees are paid from.</p>
      ${dropdown({ id: 'js-showWalletDropdown', label: 'Show "Wallet" in Balances?', value: showWallet ? 'Yes' : 'No' })}
    </div>
  `;
};

const renderBalances = ({ state }) => {
  const html = `
    <div id="js-mainConfigurationArea" class="main-area">
      ${showWalletOption({ state })}
    </div>
  `;
  return html;
};

module.exports = renderBalances;
