import type { DataTableStateEvent } from "primereact/datatable";

export const opcoesPaginacaoSeplag: {
  page: number;
  rows: number;
  rowsPerPage: number[];
} = {
  page: 0,
  rows: 10,
  rowsPerPage: [10, 20, 30],
};

export function getPageParamsSeplag(page: DataTableStateEvent): {
  page: number;
  rows: number;
} {
  return {
    page: page.page ? page.page : 0,
    rows: page.rows ? page.rows : opcoesPaginacaoSeplag.rows,
  };
}
