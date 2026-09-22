import { vi, beforeEach, test, expect } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

const mockUseDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock("react-redux", () => ({
  useDispatch: mockUseDispatch,
  useSelector: mockUseSelector,
}));

test("`useAppDispatchSeplag` referencia `useDispatch` do react-redux", async () => {
  const hooks = await import("./hooks");
  expect(hooks.useAppDispatchSeplag).toBe(mockUseDispatch);
});

test("`useAppSelectorSeplag` referencia `useSelector` do react-redux", async () => {
  const hooks = await import("./hooks");
  expect(hooks.useAppSelectorSeplag).toBe(mockUseSelector);
});
