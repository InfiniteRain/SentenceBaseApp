import {createContext} from 'react';

type HeaderButtonContext = {
  bottomTabsRoute: string | null;
  setBottomTabsRoute: (
    bottomTabsRoute: React.SetStateAction<string | null>,
  ) => void;
  onClear: (() => void) | undefined;
  setOnClear: (handler: React.SetStateAction<(() => void) | undefined>) => void;
  onPaste: (() => void) | undefined;
  setOnPaste: (handler: React.SetStateAction<(() => void) | undefined>) => void;
  onEdit: (() => void) | undefined;
  setOnEdit: (handler: React.SetStateAction<(() => void) | undefined>) => void;
  isClearDisabled: boolean;
  setClearDisabled: (disabled: React.SetStateAction<boolean>) => void;
  isPasteDisabled: boolean;
  setPasteDisabled: (disabled: React.SetStateAction<boolean>) => void;
  isEditDisabled: boolean;
  setEditDisabled: (disabled: React.SetStateAction<boolean>) => void;
};

export const HeaderButtonContext = createContext<HeaderButtonContext>(
  {} as HeaderButtonContext,
);
