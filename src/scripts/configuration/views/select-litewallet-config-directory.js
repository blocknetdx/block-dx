/* global Localize */

const fs = require('fs-extra-promise');
const { RouterView } = require('../../modules/router');
const titles = require('../modules/titles');
const route = require('../constants/routes');

const { app, dialog } = require('electron').remote;

class SelectLitewalletConfigDirectory extends RouterView {

  constructor(options) {
    super(options);
  }

  onBeforeMount(state) {}

  render(state) {

    let directory = state.get('litewalletConfigDirectory');
    if(directory && !fs.existsSync(directory)) directory = '';
    const disableContinue = directory  ? false : true;
    const { $target } = this;

    const styles = {
      p: 'margin-top:0;padding-top:0;margin-bottom:10px;margin-left:10px;margin-right:10px;',
      mainArea: 'margin-top:-10px;padding-top:0;background-color:#0e2742;overflow-y:auto;'
    };

    const html = `
      <h3>${titles.LITEWALLET_SELECT_CONFIG_DIRECTORY()}</h3>
      <div class="container">
        <div class="flex-container">
          <div class="col2-no-margin">
            <p style="${styles.p}">${Localize.text('Cannot connect to the CloudChains Litewallet. Please install the litewallet and try again. If using a custom directory, please select it below.','configurationWindowLitewalletConfig')}</p>

            <div id="js-mainConfigurationArea" class="main-area" style="${styles.mainArea}">

              <div class="main-area-item2" style="margin-left:0;margin-right:0;padding-left:0;padding-right:0;">

                <div style="display:flex;flex-direction:row:flex-wrap:nowrap;justify-content:space-between;">
                  <div>${Localize.text('CloudChains Directory')}</div>
                </div>

                <div style="margin-top:10px;display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-start;">
                  <input id="js-cloudChainsDirInput" class="js-directoryInput" type="text" value="${directory}" />
                  <button class="js-browseBtn" type="button" style="margin-top:0;margin-right:0;width:100px;min-width:100px;">${Localize.text('Browse','configurationWindowLitewalletConfig').toUpperCase()}</button>
                </div>

              </div>

            </div>

            <div id="js-buttonContainer" class="button-container">
              <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Back','configurationWindowLitewalletConfig').toUpperCase()}</button>
              <button id="js-continueBtn" type="button" ${disableContinue ? 'disabled' : ''}>${Localize.text('Continue','configurationWindowLitewalletConfig').toUpperCase()}</button>
            </div>

          </div>
        </div>
      </div>
    `;
    $target.html(html);
  }

  onMount(state, router) {

    $('#js-backBtn').on('click', e => {
      e.preventDefault();
      router.goTo(route.CONFIGURATION_MENU);
    });

    $('.js-browseBtn').on('click', async function(e) {
      e.preventDefault();
      const { filePaths } = await dialog.showOpenDialog({
        title: 'CloudChains Directory',
        defaultPath: process.platform === 'linux' ? app.getPath('home') : app.getPath('appData'),
        properties: ['openDirectory']
      });
      const [ directoryPath ] = filePaths;
      if(!directoryPath) return;
      $('#js-cloudChainsDirInput').val(directoryPath);
      $('#js-continueBtn').attr('disabled', false);
    });

    $('#js-continueBtn').on('click', e => {
      e.preventDefault();
      const dir = $('#js-cloudChainsDirInput').val();
      state.set('litewalletConfigDirectory', dir);
      router.goTo(route.SELECT_WALLETS);
    });

  }

}

module.exports = SelectLitewalletConfigDirectory;
