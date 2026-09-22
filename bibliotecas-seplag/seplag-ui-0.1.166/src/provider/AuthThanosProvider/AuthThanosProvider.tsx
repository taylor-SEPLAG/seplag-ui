import React, { useEffect } from "react";
import { loaderSeplag } from "../../componentes/Loader/loaderContent";
import type { OAuth2LibSeplag } from "../../lib/OAuth2Seplag";

export interface AuthThanosProviderSeplagProps {
  children: React.ReactNode;
  authThanos: OAuth2LibSeplag;
  isAuthenticated: boolean;
  /** Chamado com as informações do usuário assim que a autenticação é concluída. */
  onAuthenticated: (userInfo: any) => void;
}

export function AuthThanosProviderSeplag({
  children,
  authThanos,
  isAuthenticated,
  onAuthenticated,
}: Readonly<AuthThanosProviderSeplagProps>) {
  useEffect(() => {
    const authClient = authThanos;

    const initKeycloak = async () => {
      try {
        const authenticated = await authClient.initSeplag();

        if (authenticated) {
          const resp = await authClient.loadUserInfoSeplag();
          onAuthenticated(resp.contaAcesso);
        }
      } catch (error) {
        console.error("Keycloak initialization error", error);
      }
    };

    initKeycloak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>{isAuthenticated ? children : loaderSeplag()}</div>;
}
