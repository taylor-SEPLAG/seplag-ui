export interface OAuth2LibConfigSeplag {
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

class OAuth2LibSeplag {
  config: OAuth2LibConfigSeplag;
  token: TokenSeplag | null;
  refreshInterval: number | null;
  onTokenExpiredSeplag: (() => void) | null;
  private refreshPromise: Promise<TokenSeplag> | null;
  private initializationPromise: Promise<boolean | void> | null;

  constructor(config: OAuth2LibConfigSeplag) {
    this.config = {
      redirectUri: config.redirectUri,
      urlAuth: config.urlAuth,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      userInfoEndpoint: config.userInfoEndpoint,
      scope: config.scope || "read profile openid write",
      withPKCE: config.withPKCE || false,
      post_logout_redirect_uri: config.post_logout_redirect_uri,
    };
    this.token = null;
    this.refreshInterval = null;
    this.onTokenExpiredSeplag = null;
    this.refreshPromise = null;
    this.initializationPromise = null;
  }

  calculateExpiryDateSeplag(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  setOnTokenExpiredSeplag(callback: () => void): void {
    this.onTokenExpiredSeplag = callback;
  }

  async initSeplag(): Promise<boolean | void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeSeplag().catch((error: unknown) => {
        this.initializationPromise = null;
        throw error;
      });
    }

    return this.initializationPromise;
  }

  private async initializeSeplag(): Promise<boolean | void> {
    const urlParams = new URLSearchParams(globalThis.location.search);

    // O retorno do servidor de autorização deve ser tratado antes de qualquer
    // token antigo. O authorization code é de uso único e não pode aguardar uma
    // tentativa de refresh que ainda esteja no localStorage.
    if (urlParams.has("code")) {
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const expectedState = sessionStorage.getItem("oauth_state");

      if (!code || !state || state !== expectedState) {
        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("code_verifier");
        console.error("OAuth state inválido ou ausente. Reautenticando.");
        await this.authorizeSeplag();
        return;
      }

      const authenticated = await this.exchangeCodeForTokenSeplag(code);
      if (authenticated) {
        sessionStorage.removeItem("oauth_state");
        this.clearOAuthCallbackParametersSeplag();
      }
      return authenticated;
    }

    if (urlParams.has("error")) {
      const error = urlParams.get("error") ?? "unknown_error";
      const description = urlParams.get("error_description");
      throw new Error(
        `OAuth authorization failed: ${error}${description ? ` - ${description}` : ""}`,
      );
    }

    if (this.isTokenLocalStorageValidSeplag()) {
      return true;
    }

    if (await this.tryRefreshFromLocalStorageSeplag()) {
      return true;
    }

    await this.authorizeSeplag();
  }

  private clearOAuthCallbackParametersSeplag(): void {
    const callbackUrl = new URL(globalThis.location.href);
    callbackUrl.searchParams.delete("code");
    callbackUrl.searchParams.delete("state");
    callbackUrl.searchParams.delete("session_state");
    callbackUrl.searchParams.delete("iss");
    globalThis.history.replaceState(
      globalThis.history.state,
      "",
      `${callbackUrl.pathname}${callbackUrl.search}${callbackUrl.hash}`,
    );
  }

  isTokenLocalStorageValidSeplag() {
    const tokenStorage = localStorage.getItem("tk");

    if (!tokenStorage) {
      return false;
    }

    let token: TokenSeplag;
    try {
      token = JSON.parse(tokenStorage);
    } catch (error) {
      console.error("Failed to parse stored token, discarding it:", error);
      localStorage.removeItem("tk");
      return false;
    }

    if (!token?.access_token || !token?.refresh_token || !token?.expiryDate) {
      localStorage.removeItem("tk");
      return false;
    }

    const dataTimeAtual = new Date();
    const dataTimeToken = new Date(token.expiryDate);

    if (dataTimeAtual < dataTimeToken) {
      this.token = token;
      this.token.expiryDate = dataTimeToken;
      return true;
    }
    return false;
  }

  private async tryRefreshFromLocalStorageSeplag(): Promise<boolean> {
    const tokenStorage = localStorage.getItem("tk");
    if (!tokenStorage) {
      return false;
    }

    let token: TokenSeplag;
    try {
      token = JSON.parse(tokenStorage);
    } catch (error) {
      console.error("Failed to parse stored token, discarding it:", error);
      localStorage.removeItem("tk");
      return false;
    }

    if (!token?.refresh_token) {
      localStorage.removeItem("tk");
      return false;
    }

    const attemptedRefreshToken = token.refresh_token;
    this.token = token;
    try {
      await this.updateTokenSeplag();
      return true;
    } catch (error) {
      console.error("Failed to refresh token on init, discarding it:", error);

      // Outra aba pode ter renovado o token enquanto esta requisição falhava.
      // Nesse caso, reutilizamos o valor novo em vez de apagá-lo.
      if (this.reloadTokenFromLocalStorageSeplag(attemptedRefreshToken)) {
        return true;
      }

      this.token = null;
      this.removeStoredTokenIfRefreshMatchesSeplag(attemptedRefreshToken);
      return false;
    }
  }

  async authorizeSeplag() {
    const authorizationUrl = new URL(`${this.config.urlAuth}/oauth2/authorize`);

    if (this.config.withPKCE) {
      const codeVerifier = this.generateCodeVerifierSeplag();
      const codeChallenge = await this.generateCodeChallengeSeplag(codeVerifier);
      sessionStorage.setItem("code_verifier", codeVerifier);

      authorizationUrl.searchParams.append("code_challenge", codeChallenge);
      authorizationUrl.searchParams.append("code_challenge_method", "S256");
    }

    const state = this.generateCodeVerifierSeplag();
    sessionStorage.setItem("oauth_state", state);

    authorizationUrl.searchParams.append("response_type", "code");
    authorizationUrl.searchParams.append("client_id", this.config.clientId);
    authorizationUrl.searchParams.append("redirect_uri", this.config.redirectUri);
    authorizationUrl.searchParams.append("scope", this.config.scope ?? "read profile openid write");
    authorizationUrl.searchParams.append("state", state);
    globalThis.location.href = authorizationUrl.toString();
  }

  async exchangeCodeForTokenSeplag(code: string): Promise<boolean> {
    const url = `${this.config.urlAuth}/oauth2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", this.config.redirectUri);

    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    if (this.config.withPKCE) {
      const codeVerifier = sessionStorage.getItem("code_verifier");
      if (!codeVerifier) {
        console.error("Code verifier not found.");
        return false;
      }
      params.append("client_id", this.config.clientId);
      params.append("code_verifier", codeVerifier);
    } else {
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      config.headers = {
        ...config.headers,
        Authorization: `Basic ${credentials}`,
      };
    }
    config["body"] = params.toString();

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "<sem corpo>");
        throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
      }

      const body = (await response.json()) as TokenSeplag;
      if (!body?.access_token || !body?.refresh_token) {
        throw new Error("Resposta de token inválida: access_token/refresh_token ausente.");
      }
      body.expiryDate = this.calculateExpiryDateSeplag(body.expires_in);
      this.token = body;
      sessionStorage.removeItem("code_verifier");
      localStorage.setItem("tk", JSON.stringify(this.token));
      return true;
    } catch (error) {
      console.error("Failed to obtain token:", error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadUserInfoSeplag(retryOn401 = true): Promise<any> {
    if (!this.token) {
      throw new Error("Token is not available. Please authenticate first.");
    }

    try {
      const response = await fetch(this.config.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${this.token.access_token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          if (retryOn401) {
            try {
              await this.updateTokenSeplag();
              return await this.loadUserInfoSeplag(false);
            } catch (refreshError) {
              console.error("Failed to refresh token after 401:", refreshError);
            }
          }
          this.logoutSeplag();
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to load user info:", error);
      throw error;
    }
  }

  async updateTokenSeplag(): Promise<TokenSeplag> {
    if (!this.token?.refresh_token) {
      throw new Error("Refresh token is not available. Please authenticate first.");
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.updateTokenWithCrossTabLockSeplag().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async updateTokenWithCrossTabLockSeplag(): Promise<TokenSeplag> {
    const refreshTokenAtStart = this.token!.refresh_token;
    const lockManager = globalThis.navigator?.locks;

    if (lockManager) {
      return lockManager.request(this.getRefreshLockKeySeplag(), async () =>
        this.refreshTokenAfterLockSeplag(refreshTokenAtStart),
      );
    }

    // Fallback para navegadores sem Web Locks. A proteção ao salvar/apagar o
    // token ainda impede que uma resposta atrasada destrua o token de outra aba.
    return this.refreshTokenAfterLockSeplag(refreshTokenAtStart);
  }

  private async refreshTokenAfterLockSeplag(refreshTokenAtStart: string): Promise<TokenSeplag> {
    const refreshedFromOtherTab = this.reloadTokenFromLocalStorageSeplag(refreshTokenAtStart);
    if (refreshedFromOtherTab) {
      return refreshedFromOtherTab;
    }

    return this.doUpdateTokenSeplag(refreshTokenAtStart);
  }

  private getRefreshLockKeySeplag(): string {
    return `seplag_oauth_refresh:${this.config.clientId}`;
  }

  private reloadTokenFromLocalStorageSeplag(refreshTokenAtStart?: string): TokenSeplag | null {
    const tokenStorage = localStorage.getItem("tk");
    if (!tokenStorage) {
      return null;
    }

    try {
      const token = JSON.parse(tokenStorage) as TokenSeplag;
      if (!token?.access_token || !token?.refresh_token) {
        return null;
      }
      const isNewerThanCurrent = refreshTokenAtStart
        ? token.refresh_token !== refreshTokenAtStart ||
          token.access_token !== this.token?.access_token
        : !this.token || token.access_token !== this.token.access_token;
      if (!isNewerThanCurrent) {
        return null;
      }
      token.expiryDate = token.expiryDate ? new Date(token.expiryDate) : undefined;
      this.token = token;
      return token;
    } catch {
      return null;
    }
  }

  private removeStoredTokenIfRefreshMatchesSeplag(refreshToken: string): void {
    const tokenStorage = localStorage.getItem("tk");
    if (!tokenStorage) {
      return;
    }

    try {
      const storedToken = JSON.parse(tokenStorage) as TokenSeplag;
      if (storedToken.refresh_token === refreshToken) {
        localStorage.removeItem("tk");
      }
    } catch {
      localStorage.removeItem("tk");
    }
  }

  private async doUpdateTokenSeplag(refreshToken: string): Promise<TokenSeplag> {
    const url = `${this.config.urlAuth}/oauth2/token`;

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    if (this.config.withPKCE) {
      params.append("client_id", this.config.clientId);
    } else {
      const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);
      config.headers = {
        ...config.headers,
        Authorization: `Basic ${credentials}`,
      };
    }
    config["body"] = params.toString();

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "<sem corpo>");
        console.error("Refresh de token falhou:", response.status, errorBody);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorBody}`);
      }
      const body = (await response.json()) as TokenSeplag;
      if (!body?.access_token || !body?.refresh_token) {
        throw new Error(
          "Resposta de refresh de token inválida: access_token/refresh_token ausente.",
        );
      }
      body.expiryDate = this.calculateExpiryDateSeplag(body.expires_in);
      this.token = body;
      localStorage.setItem("tk", JSON.stringify(this.token));
      return this.token;
    } catch (error) {
      console.error("Failed to update token:", error);
      throw error;
    }
  }

  startTokenAutoRefreshSeplag() {
    const refreshBuffer = 60000; // 1 minute before expiration
    const checkInterval = 10000; // Check every 10 seconds

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = globalThis.setInterval(async () => {
      if (
        this.token &&
        new Date() >= new Date((this.token.expiryDate?.getTime() ?? 0) - refreshBuffer)
      ) {
        try {
          this.onTokenExpiredSeplag?.();
        } catch (error) {
          console.error("Failed to update token automatically:", error);
        }
      }
    }, checkInterval);
  }

  generateCodeVerifierSeplag(): string {
    const array = new Uint8Array(32);
    globalThis.crypto.getRandomValues(array);
    return this.base64UrlEncodeSeplag(array);
  }

  async generateCodeChallengeSeplag(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", data);

    return this.base64UrlEncodeSeplag(new Uint8Array(digest));
  }

  base64UrlEncodeSeplag(array: Uint8Array): string {
    const base64 = btoa(String.fromCodePoint(...array));
    return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }

  logoutSeplag() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    this.token = null;
    localStorage.removeItem("tk");
    sessionStorage.removeItem("code_verifier");
    sessionStorage.removeItem("oauth_state");

    const logoutUrl = new URL(`${this.config.urlAuth}/logout`);
    if (this.config.post_logout_redirect_uri) {
      logoutUrl.searchParams.append(
        "post_logout_redirect_uri",
        encodeURIComponent(this.config.post_logout_redirect_uri),
      );
    }
    globalThis.location.href = logoutUrl.toString();
  }
}

export default OAuth2LibSeplag;
