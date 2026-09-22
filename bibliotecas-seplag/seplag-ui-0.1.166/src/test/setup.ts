import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Sem `globals: true` o RTL não registra o auto-cleanup; desmonta o DOM entre os testes.
afterEach(() => {
  cleanup();
});
