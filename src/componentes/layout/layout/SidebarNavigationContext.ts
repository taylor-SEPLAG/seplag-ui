import { createContext } from 'react';

export const SidebarNavigationContext = createContext({
  compactNavigation: false,
  collapsed: false,
  expand: () => {},
});
