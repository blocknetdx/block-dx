/* global Localize */

module.exports = () => {
  return `
    <div id="js-buttonContainer" class="button-container">
      <button id="js-backBtn" type="button" class="gray-button">${Localize.text('Back', 'configurationWindowFooter').toUpperCase()}</button>
      <button id="js-continueBtn" type="button">${Localize.text('Continue', 'configurationWindowFooter').toUpperCase()}</button>
    </div>
  `;
};
