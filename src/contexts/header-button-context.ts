import {createContext} from 'react';

type HeaderButtonContext = {
  bottomTabsRoute: string | null;
  setBottomTabsRoute: (bottomTabsRoute: string | null) => void;
  onClear: (() => void) | undefined;
  setOnClear: (handler: (() => void) | undefined) => void;
  onPaste: (() => void) | undefined;
  setOnPaste: (handler: (() => void) | undefined) => void;
  onEdit: (() => void) | undefined;
  setOnEdit: (handler: (() => void) | undefined) => void;
  isClearDisabled: boolean;
  setClearDisabled: (disabled: boolean) => void;
  isPasteDisabled: boolean;
  setPasteDisabled: (disabled: boolean) => void;
  isEditDisabled: boolean;
  setEditDisabled: (disabled: boolean) => void;
};

export const HeaderButtonContext = createContext<HeaderButtonContext>(
  {} as HeaderButtonContext,
);
