// Este archivo define el tipo para la estructura del menú de cuenta
export interface AccountMenuItem {
  TEXT: string;
  LINK: string;
  ICON: string;
}

export interface AccountMenu {
  TITLE: string;
  ITEMS: AccountMenuItem[];
}

export interface AccountLocale {
  ACCOUNT_MENU: AccountMenu;
}

// Usamos un truco para forzar a TypeScript a considerar el JSON importado como este tipo
declare module "@/locales/account.json" {
  const value: AccountLocale;
  export default value;
}
