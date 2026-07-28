# Seplag UI

> Biblioteca de componentes React para sistemas internos da Seplag — construída com TypeScript, Vite e PrimeReact.

![npm](https://img.shields.io/badge/npm-%40seplag%2Fui--lib--react--18-blue)
![version](https://img.shields.io/badge/version-0.0.1-green)
![license](https://img.shields.io/badge/license-MIT-lightgrey)
![react](https://img.shields.io/badge/react-%3E%3D18-61DAFB)

---

## Sumário

- [Instalação](#instalação)
- [Setup inicial](#setup-inicial)
- [Componentes](#componentes)
  - [Botões](#botões)
  - [Campos (Fields)](#campos-fields)
  - [Modal](#modal)
  - [ModalDelete](#modaldelete)
  - [Mensagem](#mensagem)
  - [Rótulo](#rótulo)
  - [PickList](#picklist)
  - [AnexarDocumento + ImageCropper](#anexardocumento--imagecropper)
  - [CheckboxSN](#checkboxsn)
  - [GroupActions](#groupactions)
- [Hooks & Providers](#hooks--providers)
  - [Toast](#toast)
  - [UnsavedChanges](#unsavedchanges)
- [OAuth2](#oauth2)
- [Tokens de design](#tokens-de-design)
- [Documentação de protótipos](#documentação-de-protótipos)
- [Desenvolvimento](#desenvolvimento)

---

## Instalação

```bash
npm install @seplag/ui-lib-react-18
```

O pacote usa o registry interno da Seplag. Configure o `.npmrc` com as credenciais adequadas antes de instalar.

**Peer dependencies obrigatórias:**

```bash
npm install react@^18 react-dom@^18
```

---

## Setup inicial

Envolva a aplicação com os providers necessários no ponto de entrada (`main.tsx` ou `App.tsx`):

```tsx
import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";

function App() {
  return (
    <ToastProviderSeplag>{/* restante da aplicação */}</ToastProviderSeplag>
  );
}
```

---

## Componentes

### Botões

Sete variações prontas, todas estendendo `ButtonProps` do PrimeReact.

| Componente                | Uso                                       |
| ------------------------- | ----------------------------------------- |
| `BotaoSeplag`             | Botão genérico com `variant` configurável |
| `BotaoSalvarSeplag`       | Confirmar / salvar (fundo primário)       |
| `BotaoVoltarSeplag`       | Voltar / cancelar (borda primária)        |
| `BotaoAdicionarSeplag`    | Adicionar registro                        |
| `BotaoConsultarSeplag`    | Iniciar consulta/busca                    |
| `BotaoLimparFiltroSeplag` | Limpar filtros de listagem                |
| `BotaoIconSeplag`         | Botão apenas com ícone                    |

**Props de `BotaoSeplag`:**

| Prop       | Tipo                                              | Padrão   | Descrição                                 |
| ---------- | ------------------------------------------------- | -------- | ----------------------------------------- |
| `label`    | `string`                                          | —        | Texto do botão                            |
| `variant`  | `"base" \| "save" \| "back" \| "clear" \| "icon"` | `"base"` | Estilo visual                             |
| `loading`  | `boolean`                                         | `false`  | Exibe spinner durante operação assíncrona |
| `disabled` | `boolean`                                         | `false`  | Desabilita o botão                        |
| `onClick`  | `() => void`                                      | —        | Callback de clique                        |

```tsx
import {
  BotaoSeplag,
  BotaoSalvarSeplag,
  BotaoVoltarSeplag,
  BotaoAdicionarSeplag,
} from '@seplag/ui-lib-react-18';

// Botão genérico
<BotaoSeplag label="Exportar" icon="pi pi-download" onClick={exportar} />

// Salvar com loading
<BotaoSalvarSeplag loading={isSaving} onClick={handleSave} />

// Voltar
<BotaoVoltarSeplag onClick={() => navigate(-1)} />

// Adicionar
<BotaoAdicionarSeplag onClick={abrirModal} />
```

---

### Campos (Fields)

Todos os campos integram com `react-hook-form` via `Controller` e compartilham as props base de `FormFieldSeplagProps`.

**Props base (`FormFieldSeplagProps`):**

| Prop       | Tipo      | Descrição                       |
| ---------- | --------- | ------------------------------- |
| `label`    | `string`  | Rótulo do campo                 |
| `name`     | `string`  | Nome do campo no formulário     |
| `control`  | `Control` | Objeto `control` do `useForm()` |
| `disabled` | `boolean` | Desabilita o campo              |
| `required` | `boolean` | Marca como obrigatório          |

**Campos disponíveis:**

| Componente                | Uso                              |
| ------------------------- | -------------------------------- |
| `TextFieldSeplag`         | Texto livre                      |
| `TextAreaFieldSeplag`     | Texto multilinha                 |
| `EmailFieldSeplag`        | E-mail com validação de formato  |
| `NumberFieldSeplag`       | Somente números                  |
| `CurrencyFieldSeplag`     | Valor monetário (BRL)            |
| `MaskFieldSeplag`         | Campo com máscara customizável   |
| `CPFFieldSeplag`          | CPF com máscara e validação      |
| `CNPJFieldSeplag`         | CNPJ com máscara e validação     |
| `DateFieldSeplag`         | Data com calendário              |
| `FieldsetDateFieldSeplag` | Intervalo de datas (de/até)      |
| `DropdownFieldSeplag`     | Seleção única                    |
| `MultiSelectFieldSeplag`  | Seleção múltipla                 |
| `RadioButtonFieldSeplag`  | Grupo de radio buttons           |
| `CheckboxFieldSeplag`     | Checkbox simples                 |
| `SwitchFieldSeplag`       | Toggle on/off                    |
| `SearchFieldSeplag`       | Campo com autocomplete/sugestões |
| `ImageUploadFieldSeplag`  | Upload de imagem com preview     |

```tsx
import { useForm } from "react-hook-form";
import {
  TextFieldSeplag,
  CPFFieldSeplag,
  DateFieldSeplag,
  DropdownFieldSeplag,
} from "@seplag/ui-lib-react-18";

type FormData = {
  nome: string;
  cpf: string;
  nascimento: Date;
  cargo: string;
};

function FormularioServidor() {
  const { control, handleSubmit } = useForm<FormData>();

  const cargos = [
    { label: "Analista", value: "analista" },
    { label: "Técnico", value: "tecnico" },
  ];

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <TextFieldSeplag
        label="Nome completo"
        name="nome"
        control={control}
        required
      />
      <CPFFieldSeplag label="CPF" name="cpf" control={control} required />
      <DateFieldSeplag
        label="Data de nascimento"
        name="nascimento"
        control={control}
      />
      <DropdownFieldSeplag
        label="Cargo"
        name="cargo"
        control={control}
        options={cargos}
        optionLabel="label"
        optionValue="value"
      />
      <BotaoSalvarSeplag type="submit" />
    </form>
  );
}
```

---

### Modal

Dialog reutilizável com header, footer (ações) e corpo customizável.

| Prop           | Tipo         | Padrão     | Descrição                              |
| -------------- | ------------ | ---------- | -------------------------------------- |
| `visible`      | `boolean`    | —          | Controla visibilidade                  |
| `titulo`       | `string`     | —          | Título do header                       |
| `fechar`       | `() => void` | —          | Callback ao fechar                     |
| `funcAcao`     | `() => void` | —          | Callback do botão de ação              |
| `labelAcao`    | `string`     | —          | Texto do botão de ação                 |
| `labelFechar`  | `string`     | `"Voltar"` | Texto do botão fechar                  |
| `isSubmit`     | `boolean`    | `false`    | Torna o botão de ação do tipo `submit` |
| `tamanho`      | `string`     | `"50vw"`   | Largura do dialog                      |
| `customFooter` | `ReactNode`  | —          | Substitui o footer padrão              |
| `hideFooter`   | `boolean`    | `false`    | Oculta o footer                        |

```tsx
import { ModalSeplag } from "@seplag/ui-lib-react-18";

function ExemploModal() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <BotaoAdicionarSeplag onClick={() => setVisible(true)} />

      <ModalSeplag
        visible={visible}
        titulo="Cadastrar servidor"
        fechar={() => setVisible(false)}
        funcAcao={handleSalvar}
        labelAcao="Salvar"
        tamanho="60vw"
      >
        <FormularioServidor />
      </ModalSeplag>
    </>
  );
}
```

---

### ModalDelete

Modal de confirmação de exclusão com mensagem padrão.

```tsx
import { ModalDeleteSeplag } from "@seplag/ui-lib-react-18";

<ModalDeleteSeplag
  visible={showDelete}
  fechar={() => setShowDelete(false)}
  funcAcao={() => deletar(selectedId)}
/>;
```

---

### Mensagem

Exibe mensagens de feedback com severidade visual.

| Prop       | Tipo                     | Valores                                    |
| ---------- | ------------------------ | ------------------------------------------ |
| `message`  | `string`                 | Texto da mensagem                          |
| `severity` | `MensagemSeveritySeplag` | `"success"` `"info"` `"warning"` `"error"` |

```tsx
import { MensagemSeplag } from '@seplag/ui-lib-react-18';

<MensagemSeplag message="Registro salvo com sucesso." severity="success" />
<MensagemSeplag message="CPF já cadastrado no sistema." severity="warning" />
<MensagemSeplag message="Falha ao conectar com o servidor." severity="error" />
```

---

### Rótulo

Exibe um par chave/valor estilizado, útil em telas de visualização.

```tsx
import { RotuloSeplag } from '@seplag/ui-lib-react-18';

<RotuloSeplag label="Nome" value="João da Silva" />
<RotuloSeplag label="Matrícula" value="123456" />
```

---

### PickList

Componente de duas listas (disponível / selecionado) para seleção múltipla por drag-and-drop.

```tsx
import { PickListSeplag } from "@seplag/ui-lib-react-18";

<PickListSeplag
  source={disponiveis}
  target={selecionados}
  onChange={({ source, target }) => {
    setDisponiveis(source);
    setSelecionados(target);
  }}
  itemTemplate={(item) => <span>{item.nome}</span>}
/>;
```

---

### AnexarDocumento + ImageCropper

Upload de documentos com suporte a crop de imagem.

```tsx
import { AnexarDocumentoSeplag, ImageCropperSeplag } from '@seplag/ui-lib-react-18';

// Upload de documento genérico
<AnexarDocumentoSeplag
  onUpload={(arquivo) => enviarArquivo(arquivo)}
  accept=".pdf,.doc,.docx"
  maxSize={5_000_000} // 5 MB
/>

// Upload de imagem com crop
<ImageCropperSeplag
  onCropComplete={(imagemCropada) => salvarFoto(imagemCropada)}
  aspectRatio={1} // quadrado (foto de perfil)
/>
```

---

### CheckboxSN

Checkbox que representa Sim/Não com valor booleano.

```tsx
import { CheckboxSNSeplag } from "@seplag/ui-lib-react-18";

<CheckboxSNSeplag
  label="Ativo"
  checked={isAtivo}
  onChange={(value) => setIsAtivo(value)}
/>;
```

---

### GroupActions

Agrupa botões de ação (editar, excluir etc.) para uso em linhas de tabela.

```tsx
import { GroupActionsSeplag } from "@seplag/ui-lib-react-18";

<GroupActionsSeplag
  onEdit={() => editar(row.id)}
  onDelete={() => confirmarExclusao(row.id)}
/>;
```

---

## Hooks & Providers

### Toast

**1. Configure o provider** (uma vez, no topo da árvore):

```tsx
import { ToastProviderSeplag } from "@seplag/ui-lib-react-18";

<ToastProviderSeplag>
  <App />
</ToastProviderSeplag>;
```

**2. Use o hook em qualquer componente filho:**

```tsx
import { useToastSeplag } from "@seplag/ui-lib-react-18";

function MeuComponente() {
  const { toastSucesso, toastErro, toastAtencao } = useToastSeplag();

  const salvar = async () => {
    try {
      await api.salvar(dados);
      toastSucesso("Registro salvo com sucesso!");
    } catch {
      toastErro("Não foi possível salvar. Tente novamente.");
    }
  };

  return <BotaoSalvarSeplag onClick={salvar} />;
}
```

| Método                 | Severidade   | Summary padrão |
| ---------------------- | ------------ | -------------- |
| `toastSucesso(detail)` | `success`    | `"Sucesso"`    |
| `toastErro(detail)`    | `error`      | `"Erro"`       |
| `toastAtencao(detail)` | `warn`       | `"Atenção"`    |
| `printToast(msg)`      | customizável | livre          |

---

### UnsavedChanges

Protege o usuário de perder dados ao navegar com o formulário sujo.

**1. Envolva a página com o provider:**

```tsx
import { UnsavedChangesProviderSeplag } from "@seplag/ui-lib-react-18";

function PaginaCadastro() {
  return (
    <UnsavedChangesProviderSeplag>
      <FormularioServidor />
    </UnsavedChangesProviderSeplag>
  );
}
```

**2. Registre o estado "sujo" no componente de formulário:**

```tsx
import { useUnsavedChangesSyncSeplag } from "@seplag/ui-lib-react-18";

function FormularioServidor() {
  const {
    formState: { isDirty },
    control,
    handleSubmit,
  } = useForm();

  // Sincroniza o estado do formulário com o provider
  useUnsavedChangesSyncSeplag(isDirty);

  return (
    <form onSubmit={handleSubmit(salvar)}>
      <TextFieldSeplag name="nome" label="Nome" control={control} />
      <BotaoSalvarSeplag type="submit" />
    </form>
  );
}
```

Ao tentar navegar com `isDirty = true`, um modal de confirmação é exibido automaticamente.

---

## OAuth2

Classe para fluxo OAuth2 com suporte a PKCE.

```ts
import { OAuth2Lib } from "@seplag/ui-lib-react-18";

const auth = new OAuth2Lib({
  clientId: "meu-client-id",
  urlAuth: "https://auth.seplag.mt.gov.br",
  redirectUri: "https://minha-app.seplag.mt.gov.br/callback",
  userInfoEndpoint: "/userinfo",
  scope: "openid profile",
  withPKCE: true,
});

// Redirecionar para login
auth.authorize();

// Trocar código por token (na rota de callback)
await auth.exchangeCode(params.get("code")!);

// Obter dados do usuário autenticado
const user = await auth.getUserInfo();

// Atualizar token
await auth.refreshToken();

// Logout
auth.logout();
```

---

## Tokens de design

Importe os tokens para manter consistência visual:

```ts
import {
  SEPLAG_PRIMARY,
  SEPLAG_PRIMARY_DARK,
  SEPLAG_SECONDARY,
  SEPLAG_SUCCESS,
  SEPLAG_WARNING,
  SEPLAG_DANGER,
  SEPLAG_INFO,
} from "@seplag/ui-lib-react-18";

const estiloCustom = {
  backgroundColor: SEPLAG_PRIMARY,
  borderColor: SEPLAG_PRIMARY_DARK,
};
```

| Token                  | Uso                         |
| ---------------------- | --------------------------- |
| `SEPLAG_PRIMARY`       | Cor principal da marca      |
| `SEPLAG_PRIMARY_DARK`  | Variante escura do primário |
| `SEPLAG_PRIMARY_LIGHT` | Variante clara do primário  |
| `SEPLAG_SECONDARY`     | Cor secundária              |
| `SEPLAG_SUCCESS`       | Feedback positivo           |
| `SEPLAG_WARNING`       | Alerta                      |
| `SEPLAG_DANGER`        | Erro / exclusão             |
| `SEPLAG_INFO`          | Informação                  |

---

## Documentação de protótipos

O repositório também mantém documentos de contexto e status para continuidade dos protótipos:

| Documento | Conteúdo |
| --------- | -------- |
| `docs/CONTEXTO_PROJETO.md` | Visão geral do projeto, decisões já tomadas, rotas e orientações para continuar o trabalho. |
| `docs/folha-pagamento-status-implementacao.md` | Status do módulo Folha de Pagamento, incluindo Solicitações de Ajustes da Folha, Competência e Tabelas de Referência. |

---

## Desenvolvimento

### Pré-requisitos

- Node.js `>=18`
- npm `>=9`

### Scripts

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Para executar o build é necessário ter instalado o rimraf para isso instalar com o seguinte comando
npm install -g rimraf

# Build da biblioteca
npm run build

# Gerar pacote .tgz local para testes
npm run pack:local

# Publicar no registry interno
npm run package

# Lint
npm run lint
```

### Instalar localmente em outro projeto

```bash
# No repositório da biblioteca
npm run pack:local

# No projeto consumidor
npm install ../seplag-ui/seplag-ui-0.0.1.tgz
```

### Estrutura do projeto

```
src/
├── componentes/       # Todos os componentes públicos
│   ├── Botao/
│   ├── Fields/        # Campos de formulário
│   ├── Modal/
│   ├── Mensagem/
│   └── ...
├── hooks/             # Hooks utilitários (useToastSeplag)
├── provider/          # ToastProviderSeplag
├── lib/               # OAuth2Lib
├── tokens/            # Design tokens (cores)
└── uteis/             # Formatadores e validadores
```
