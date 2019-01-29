const renderSidebar = ({ state }) => {
  const active = state.get('active');
  const header = `<div class=sidebar-header>Menu</div>`;
  const links = state.get('sidebarItems')
    .map((item, idx) => {
      const { text = '' } = item;
      return `<div class="sidebar-item js-sidebarItem ${active === idx ? 'sidebar-active-link' : 'sidebar-inactive-link'}" data-sidebar-index="${idx}" > ${text}</div>`;
    })
    .join('\n');
  const html = header + links;
  return html;
};

module.exports = renderSidebar;
