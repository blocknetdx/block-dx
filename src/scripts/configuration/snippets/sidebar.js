const sidebar = idx => {
  return `
    <div class="sidebar-item js-sidebarItem" data-sidebar-index="${0}" ><i class="${idx >= 0 ? 'fa fa-circle' : 'far fa-circle'} radio-icon"></i> Configuration Setup</div>
    <div class="sidebar-item js-sidebarItem" data-sidebar-index="${1}" ><i class="${idx >= 1 ? 'fa fa-circle' : 'far fa-circle'} radio-icon"></i> RPC Settings</div>
  `;
};

module.exports = sidebar;
