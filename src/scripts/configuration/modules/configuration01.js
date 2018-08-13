// const removeNameFromId = str => str.replace(/^\w+--/, '');

const renderConfiguration1 = ({ state }) => {
  const selected = state.get('selectedAbbrs');
  const items = state
    .get('wallets')
    .reduce((arr, w) => {
      return arr.some(ww => ww.abbr === w.abbr) ? arr : [...arr, w];
    }, []);
  const skip = state.get('skipSetup');
  const html = `
          <p style="margin-top:0;padding-top:0;padding-left:10px;padding-right:10px;margin-bottom:10px;">In order to conduct peer-to-peer trades, Block DX requires RPC access to the wallets of each token that will be traded. Select the blockchains of the wallets that are installed.</p>
          <div id="js-mainConfigurationArea" class="main-area" style="position:relative;${skip ? 'opacity:.6;overflow-y:hidden;' : 'opacity:1;overflow-y:scroll;'}">
            ${items
              .map(i => {
                if(i.abbr === 'BLOCK') {
                  return `<div class="main-area-item" style="cursor:default;opacity:1;"><i class="far fa-check-square radio-icon"></i> ${i.name} (${i.abbr})</div>`;
                } else {
                  return `<div class="js-mainAreaItem main-area-item" data-id="${i.abbr}"><i class="far ${selected.has(i.abbr) ? 'fa-check-square' : 'fa-square'} radio-icon"></i> ${i.name} (${i.abbr})</div>`;
                }
              })
              .join('\n')
            }
            <div id="js-overlay" style="display:${skip ? 'block' : 'none'};position:absolute;left:0;top:0;width:100%;height:100%;background-color:#000;opacity:0;"></div>
          </div>
          <div style="padding: 10px; cursor: pointer;padding-bottom:0;">
            <div id="js-skip" class="main-area-item"><i class="far ${skip ? 'fa-check-square' : 'fa-square'} radio-icon"></i> Skip and setup Block DX manually (not recommended)</div>
          </div>

          <div id="js-buttonContainer" class="button-container">
            <button id="js-backBtn" type="button" class="gray-button">CANCEL</button>
            <button id="js-continueBtn" type="button">CONTINUE</button>
          </div>
          `;
  return html;
};

module.exports = renderConfiguration1;
