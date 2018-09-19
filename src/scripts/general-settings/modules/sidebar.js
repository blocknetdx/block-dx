const renderSidebar = ({ state }) => {
  const active = state.get('active');
  const html = state.get('sidebarItems')
    .map((item, idx) => {
      const { text = '' } = item;
      return `<div class="sidebar-item js-sidebarItem" data-sidebar-index="${idx}" ><i class="${active === idx ? 'fa fa-circle' : 'far fa-circle'} radio-icon"></i> ${text}</div>`;
    })
    .join('\n');
  return html;
};

module.exports = renderSidebar;
