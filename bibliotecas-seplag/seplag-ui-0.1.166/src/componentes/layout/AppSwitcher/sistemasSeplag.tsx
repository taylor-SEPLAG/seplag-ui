import React from "react";
import { SistemaSeplagId } from "../../../type/sistemas";
import {
  BankNoteSeplag,
  ChartBreakoutSquareSeplag,
  ClipboardCheckSeplag,
  CoinsHandSeplag,
  FileCheckSeplag,
  MedicalCircleSeplag,
  StickerSquareSeplag,
  UserCheckSeplag,
  UserPlusSeplag,
} from "../../CustomIcons";
import type { AppSystemItemSeplag } from "./index";

export const sistemasSeplag: AppSystemItemSeplag[] = [
  {
    id: "1",
    label: SistemaSeplagId.GESTAO_DE_PESSOAS,
    url: "/gestao/app",
    icon: React.createElement(UserCheckSeplag),
  },
  {
    id: "2",
    label: SistemaSeplagId.FOLHA,
    url: "/folha/app",
    icon: React.createElement(BankNoteSeplag),
  },
  {
    id: "3",
    label: SistemaSeplagId.PERICIA,
    url: "#",
    icon: React.createElement(MedicalCircleSeplag),
  },
  {
    id: "4",
    label: SistemaSeplagId.CONSIGNADO,
    url: "#",
    icon: React.createElement(CoinsHandSeplag),
  },
  {
    id: "5",
    label: SistemaSeplagId.CONTAGEM_DE_TEMPO,
    url: "#",
    icon: React.createElement(ChartBreakoutSquareSeplag),
  },
  {
    id: "6",
    label: SistemaSeplagId.E_SOCIAL,
    url: "/integracao/app",
    icon: React.createElement(StickerSquareSeplag),
  },
  {
    id: "7",
    label: SistemaSeplagId.APOSENTADORIA,
    url: "#",
    icon: React.createElement(UserPlusSeplag),
  },
  {
    id: "8",
    label: SistemaSeplagId.CONFORMIDADE,
    url: "#",
    icon: React.createElement(ClipboardCheckSeplag),
  },
  {
    id: "9",
    label: SistemaSeplagId.AUDITORIA,
    url: "#",
    icon: React.createElement(FileCheckSeplag),
  },
];
