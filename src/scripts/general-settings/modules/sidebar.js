const renderSidebar = ({ state, Localize }) => {
  const active = state.get('active');
  const header = `<div class=sidebar-header>${Localize.text('Menu', 'generalSettingsWindow')}</div>`;
  const links = state.get('sidebarItems')
    .map((item, idx) => {
      const { sidebarText = '' } = item;
      return `<div class="sidebar-item js-sidebarItem ${active === idx ? 'sidebar-active-link' : 'sidebar-inactive-link'}" data-sidebar-index="${idx}" > ${sidebarText}</div>`;
    })
    .join('\n');
  const html = header + links;
  return html;
};

module.exports = renderSidebar;
