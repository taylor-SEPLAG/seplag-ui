import { vi, beforeEach, test, expect } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

vi.mock("./../features/menu", () => ({
  menuSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/api", () => ({
  apiSlice: {
    reducerPath: "api",
    reducer: (s = {}, _a: any) => s,
    middleware: () => (next: any) => (action: any) => next(action),
  },
}));
vi.mock("../features/vinculo/vinculoApi", () => ({
  vinculoApi: {
    reducerPath: "vinculoApi",
    reducer: (s = {}, _a: any) => s,
    middleware: () => (next: any) => (action: any) => next(action),
  },
}));

vi.mock("../features/auth/authSlice", () => ({
  authSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/loader/loaderSlice", () => ({
  loaderSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/message/messageSlice", () => ({
  messageSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/user/vinculoSelecionado", () => ({
  vinculoSelecionadoSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/user/userSlice", () => ({
  userSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/user/userPerfilVinculoSlice", () => ({
  userPerfilVinculoSlice: { reducer: (s = {}, _a: any) => s },
}));
vi.mock("../features/upalod/UploadSlice", () => ({
  uploadReducer: (s = {}, _a: any) => s,
}));

vi.mock("../middleware/uploadQueue", () => ({
  uploadQueue: {
    middleware: () => (next: any) => (action: any) => next(action),
  },
}));

test("store configura dispatch e getState", async () => {
  const mod = await import("./store");
  const { store } = mod;
  expect(store).toBeDefined();
  expect(typeof store.dispatch).toBe("function");
  expect(typeof store.getState).toBe("function");
  const state = store.getState();
  expect(state).toBeTruthy();
});

test("store aceita dispatch de ação simples sem lançar erro", async () => {
  const { store } = await import("./store");
  expect(() => store.dispatch({ type: "test/noop" })).not.toThrow();
});
