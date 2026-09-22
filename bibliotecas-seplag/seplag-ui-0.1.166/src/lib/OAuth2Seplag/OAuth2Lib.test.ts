import { beforeEach, describe, expect, it, vi } from "vitest";
import OAuth2LibSeplag, { type OAuth2LibConfigSeplag } from "./OAuth2Lib";

const config: OAuth2LibConfigSeplag = {
  redirectUri: "https://app.example.test/integracao",
  urlAuth: "https://auth.example.test",
  clientId: "front-integracao",
  userInfoEndpoint: "https://auth.example.test/userinfo",
  withPKCE: true,
};

const tokenResponse = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 300,
};

const expiredToken = {
  access_token: "expired-access-token",
  refresh_token: "expired-refresh-token",
  expires_in: 300,
  expiryDate: new Date(0),
};

describe("OAuth2LibSeplag", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.unstubAllGlobals();
    globalThis.history.replaceState({}, "", "/");
  });

  it("processa o callback antes de tentar renovar um token expirado", async () => {
    globalThis.history.replaceState({}, "", "/integracao?code=new-code&state=state-1");
    sessionStorage.setItem("oauth_state", "state-1");
    sessionStorage.setItem("code_verifier", "verifier-1");
    localStorage.setItem(
      "tk",
      JSON.stringify({
        access_token: "expired-access-token",
        refresh_token: "expired-refresh-token",
        expires_in: 300,
        expiryDate: new Date(0),
      }),
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const authenticated = await new OAuth2LibSeplag(config).initSeplag();

    expect(authenticated).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestBody = String(fetchMock.mock.calls[0]?.[1]?.body);
    expect(requestBody).toContain("grant_type=authorization_code");
    expect(requestBody).toContain("code=new-code");
    expect(requestBody).not.toContain("expired-refresh-token");
  });

  it("troca o mesmo authorization code uma unica vez em inicializacoes concorrentes", async () => {
    globalThis.history.replaceState({}, "", "/integracao?code=new-code&state=state-1");
    sessionStorage.setItem("oauth_state", "state-1");
    sessionStorage.setItem("code_verifier", "verifier-1");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const oauth = new OAuth2LibSeplag(config);

    const results = await Promise.all([oauth.initSeplag(), oauth.initSeplag()]);

    expect(results).toEqual([true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("remove os parametros OAuth da URL somente depois da autenticacao", async () => {
    globalThis.history.replaceState(
      {},
      "",
      "/integracao?code=new-code&state=state-1&filtro=ativo#resultado",
    );
    sessionStorage.setItem("oauth_state", "state-1");
    sessionStorage.setItem("code_verifier", "verifier-1");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(tokenResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await new OAuth2LibSeplag(config).initSeplag();

    expect(globalThis.location.href).toBe(
      "http://localhost:3000/integracao?filtro=ativo#resultado",
    );
    expect(sessionStorage.getItem("oauth_state")).toBeNull();
    expect(sessionStorage.getItem("code_verifier")).toBeNull();
  });

  it("inclui a resposta do servidor no erro da troca de token", async () => {
    globalThis.history.replaceState({}, "", "/integracao?code=new-code&state=state-1");
    sessionStorage.setItem("oauth_state", "state-1");
    sessionStorage.setItem("code_verifier", "verifier-1");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response('{"error":"invalid_grant"}', {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(new OAuth2LibSeplag(config).initSeplag()).rejects.toThrow(
      'HTTP error! Status: 400 - {"error":"invalid_grant"}',
    );
    expect(globalThis.location.search).toContain("code=new-code");
    expect(sessionStorage.getItem("oauth_state")).toBe("state-1");
    expect(sessionStorage.getItem("code_verifier")).toBe("verifier-1");
  });

  it("serializa a renovacao entre instancias e reutiliza o token da primeira aba", async () => {
    localStorage.setItem("tk", JSON.stringify(expiredToken));

    let lockQueue = Promise.resolve();
    const requestLock = vi.fn((_: string, callback: () => Promise<unknown>) => {
      const result = lockQueue.then(callback);
      lockQueue = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    });
    vi.stubGlobal("navigator", { locks: { request: requestLock } });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all([
      new OAuth2LibSeplag(config).initSeplag(),
      new OAuth2LibSeplag(config).initSeplag(),
    ]);

    expect(results).toEqual([true, true]);
    expect(requestLock).toHaveBeenCalledTimes(2);
    expect(requestLock.mock.calls[0]?.[0]).toBe("seplag_oauth_refresh:front-integracao");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("nao apaga o token novo salvo por outra aba quando sua renovacao falha", async () => {
    localStorage.setItem("tk", JSON.stringify(expiredToken));
    vi.stubGlobal("navigator", {});

    let finishRefresh!: (response: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => {
        finishRefresh = resolve;
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const authentication = new OAuth2LibSeplag(config).initSeplag();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const tokenFromOtherTab = {
      access_token: "new-access-token-from-other-tab",
      refresh_token: "new-refresh-token-from-other-tab",
      expires_in: 300,
      expiryDate: new Date(Date.now() + 300_000),
    };
    localStorage.setItem("tk", JSON.stringify(tokenFromOtherTab));
    finishRefresh(
      new Response('{"error":"invalid_grant"}', {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(authentication).resolves.toBe(true);
    expect(JSON.parse(localStorage.getItem("tk") ?? "null")).toMatchObject({
      ...tokenFromOtherTab,
      expiryDate: tokenFromOtherTab.expiryDate.toISOString(),
    });
  });
});
