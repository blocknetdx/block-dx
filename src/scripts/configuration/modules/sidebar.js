const renderSidebar = ({ state }) => {
  const selected = state.get('sidebarSelected');
  const html = state.get('sidebarItems')
    .map((item, idx) => {
      const { text = '' } = item;
      return `<div class="sidebar-item js-sidebarItem" data-sidebar-index="${idx}" ><i class="${selected >= idx ? 'fa fa-circle' : 'far fa-circle'} radio-icon"></i> ${text}</div>`;
    })
    .join('\n');
  return html;
};

module.exports = renderSidebar;
