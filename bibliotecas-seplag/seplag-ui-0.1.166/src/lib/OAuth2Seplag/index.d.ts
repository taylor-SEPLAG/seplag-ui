interface OAuth2LibConfigSeplag {
  redirectUri: string;
  urlAuth: string;
  clientId: string;
  clientSecret?: string;
  userInfoEndpoint: string;
  scope?: string;
  withPKCE?: boolean;
  post_logout_redirect_uri?: string | null;
}

interface TokenSeplag {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expiryDate?: Date;
}

declare class OAuth2LibSeplag {
  config: OAuth2LibConfigSeplag;
  token: TokenSeplag | null;
  refreshInterval: number | null;
  onTokenExpiredSeplag: (() => void) | null;

  constructor(config: OAuth2LibConfigSeplag);

  calculateExpiryDateSeplag(expiresIn: number): Date;

  logoutSeplag(): Promise<void>;

  initSeplag(): Promise<void>;

  authorizeSeplag(): Promise<void>;

  exchangeCodeForTokenSeplag(code: string): Promise<boolean>;

  loadUserInfoSeplag(): Promise<any>;

  updateTokenSeplag(): Promise<TokenSeplag>;

  startTokenAutoRefreshSeplag(): void;

  generateCodeVerifierSeplag(): string;

  generateCodeChallengeSeplag(codeVerifier: string): Promise<string>;

  base64UrlEncodeSeplag(array: Uint8Array): string;
}

export { OAuth2LibConfigSeplag, TokenSeplag };
export default OAuth2LibSeplag;
