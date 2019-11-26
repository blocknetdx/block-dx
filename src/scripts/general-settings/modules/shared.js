module.exports.dropdown = ({ id, label, value }) => {
  return `
      <div class="input-group" style="margin-bottom:0;margin-top:10px;">
        <label style="flex-basis:0;flex-grow:1;">${label}</label>
        <div ${id ? `id="${id}"` : ''} class="js-dropdownButton dropdown-button ${id ? '' : 'disabled'}" style="flex-basis:0;flex-grow:1;">
          <div style="margin-left:10px;">${value}</div>
          <div><i class="fas fa-angle-down radio-icon" style="margin-right:0;font-size:20px;"></i></div>
        </div>
      </div>
  `;
};
