import {createContext} from 'react';

export enum Page {
  MainMenu,
}

export const AppStateContext = createContext<{
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}>({
  currentPage: Page.MainMenu,
  setCurrentPage: (_page: Page) => {},
});
