export interface IMenuSeplag {
  label: string | null
  icon: string
  items?: IMenuSeplag[]
  nameRef?: string | null
  to?: string
  activeRoutes?: string[]
  url?: string
  component?: React.ReactNode
  visibleOnRouter?: boolean
  visibleOnMenu?: boolean
  badgeStyleClass?: string
  permissionKeys?: string[] | null
  disabled?: boolean
}

export interface IVinculoSeplag {
  numrVinculo: string | number;
  statVinculo: string;
  unidade?: { descUnidade?: string };
  orgao?: { descOrgao?: string };
}

export const getPermissionsSeplag = (
  storageKey = "permissions",
): string[] | null => {
  const json = localStorage.getItem(storageKey);
  return json ? JSON.parse(json) : null;
};

export const hasPermissionByKeysSeplag = (
  keys: string[] | null,
  permissions = getPermissionsSeplag(),
): boolean => {
 // Se não houver chaves para verificar ou se as permissões do usuário não forem um array, negamos o acesso.
  if (!keys || !Array.isArray(permissions)) {
    return false
  }

  // Usamos .some() que é mais performático e legível, pois ele para a execução 
  // assim que encontra o primeiro 'true'.
  return keys.some(key => permissions.includes(key))
};

export const hasPermissionByRouteListSeplag = (
  menu: IMenuSeplag[],
): IMenuSeplag[] => {
  const permissions = getPermissionsSeplag();

  const check = (item: IMenuSeplag) => {
    const permissionKeys = item?.permissionKeys

    // 1. Verifica permissões diretas
    if (permissionKeys) {
      const has = hasPermissionByKeysSeplag(permissionKeys, permissions)
      item.visibleOnRouter = has
      item.visibleOnMenu = has
    } else {
      // Se não tem chaves de permissão, é visível por padrão (ex: agrupadores)      
      item.visibleOnRouter = true
      item.visibleOnMenu = true
    }

    // 2. Oculta se o label for nulo (regra de negócio do sistema)
    if (item.label === null) {
      item.visibleOnMenu = false
    }

    // 3. Processa filhos e aplica regra de herança de visibilidade
    if (item.items && item.items.length > 0) {
    // Filtra os filhos mantendo apenas os que o usuário tem permissão      
      item.items = item.items.filter((subItem) => {
        check(subItem)
        return subItem.visibleOnMenu === true
      })

      /**
       * LÓGICA DE VISIBILIDADE DO PAI:
       * Um item pai só será visível se tiver pelo menos um filho visível.
       * 
       * PARA VOLTAR AO COMPORTAMENTO ANTERIOR (Mostrar pai mesmo sem filhos permitidos):
       * Remova ou comente o bloco 'if' abaixo.
       */
      if (item.items.length === 0) {
        item.visibleOnMenu = false
      }
    }

    return item
  }

  // Processa o menu de nível superior e remove os itens que resultaram em invisíveis
  return menu.filter((item) => {
    check(item)
    return item.visibleOnMenu === true
  })
};
