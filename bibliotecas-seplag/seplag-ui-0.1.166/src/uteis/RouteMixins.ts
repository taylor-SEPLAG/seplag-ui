export interface RouteMixingResp {
  nameRef: string | null;
  label: string | null;
  to: string;
  icon: string;
  component: any;
  permissionKeys: string[] | null;
  visibleOnRouter: boolean;
}

export default function Route(
  nameRef: null | string,
  label: null | string,
  url: string,
  component: any,
  permissionKeys: null | string[],
): RouteMixingResp {
  return {
    nameRef: nameRef,
    label: label,
    to: url,
    icon: "pi pi-circle-on",
    component: component,
    permissionKeys:
      Array.isArray(permissionKeys) && permissionKeys.length > 0 ? permissionKeys : null,
    visibleOnRouter: true,
  };
}
