import{t as e}from"./jsx-runtime-ChuIQw48.js";import"./index-DyeHa39m.js";import{t}from"./DocPage-CHgTh2J-.js";var n=e(),r=[{title:`Visão geral`,description:`Biblioteca cliente OAuth2 útil para autenticação com ou sem PKCE e renovação automática de token.`,example:null,code:`// A classe expõe métodos para autorizar, trocar código por token, carregar info do usuário e atualizar tokens.`},{title:`Instanciação rápida`,description:`Exemplo mínimo de uso: criar a instância e inicializar o fluxo.`,example:null,code:`import OAuth2LibSeplag, { OAuth2LibConfigSeplag } from "src/lib/OAuth2Seplag/OAuth2Lib";

const config: OAuth2LibConfigSeplag = {
  redirectUri: "https://app.exemplo.com/callback",
  urlAuth: "https://auth.exemplo.com",
  clientId: "meu-client-id",
  clientSecret: "meu-client-secret", // não necessário se usar PKCE
  userInfoEndpoint: "https://auth.exemplo.com/userinfo",
  withPKCE: false,
};

const oauth = new OAuth2LibSeplag(config);
await oauth.initSeplag(); // inicia fluxo — pode redirecionar para login se necessário
`},{title:`Uso com PKCE`,description:"Habilite `withPKCE: true` no config. A biblioteca gerencia code_verifier e code_challenge.",example:null,code:`const config = { ... , withPKCE: true };
const oauth = new OAuth2LibSeplag(config);
await oauth.initSeplag();
`},{title:`Principais métodos`,description:`Exemplos de chamadas úteis após autenticação:`,example:null,code:`// trocar código por token (internamente chamado em init)
await oauth.exchangeCodeForTokenSeplag(code);

// carregar informações do usuário
const user = await oauth.loadUserInfoSeplag();

// forçar atualização do token usando refresh_token
await oauth.updateTokenSeplag();

// iniciar verificação periódica para refresh automático
oauth.startTokenAutoRefreshSeplag();

// deslogar
oauth.logoutSeplag();
`}],i=[{name:`OAuth2LibConfigSeplag`,type:`object`,required:!0,description:`Configuração usada no construtor: redirectUri, urlAuth, clientId, clientSecret (opcional com PKCE), userInfoEndpoint, scope, withPKCE, post_logout_redirect_uri.`},{name:`TokenSeplag`,type:`object`,required:!1,description:`Formato do token retornado: access_token, refresh_token, expires_in e expiryDate (interno).`}];function a(){return(0,n.jsx)(t,{title:`OAuth2LibSeplag`,description:`Cliente OAuth2 para autenticação, suporte a PKCE e renovação automática de tokens.`,badge:`Estável`,since:`v0.0.1`,importStatement:`import OAuth2LibSeplag, { OAuth2LibConfigSeplag } from "src/lib/OAuth2Seplag/OAuth2Lib";`,sections:r,props:i})}export{a as default};