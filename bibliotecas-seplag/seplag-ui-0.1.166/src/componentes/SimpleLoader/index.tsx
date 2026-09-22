import { loaderSeplag } from "@componentes/Loader/loaderContent";

interface SimpleLoaderSeplagProps {
  isLoading: boolean;
  message?: string;
}

export function SimpleLoaderSeplag({ isLoading, message }: SimpleLoaderSeplagProps) {
  return isLoading ? loaderSeplag(message) : null;
}
