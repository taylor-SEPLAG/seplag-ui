import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AutoCompleteSeplag } from "./index";

const showSpy = vi.fn();
const hideSpy = vi.fn();

beforeEach(() => {
  showSpy.mockClear();
  hideSpy.mockClear();
});

vi.mock("primereact/utils", () => ({
  classNames: (...values: Array<string | undefined | null | false>) =>
    values.filter(Boolean).join(" "),
}));

vi.mock("primereact/autocomplete", async () => {
  const React = await import("react");

  type MockAutoCompleteProps = {
    value?: string;
    suggestions?: unknown[];
    showEmptyMessage?: boolean;
    emptyMessage?: string;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (event: {
      originalEvent: React.ChangeEvent<HTMLInputElement>;
      value: string;
    }) => void;
    completeMethod?: (event: { originalEvent: Event; query: string }) => void;
    onSelect?: (event: { originalEvent: React.MouseEvent<HTMLButtonElement>; value: unknown }) => void;
  };

  const MockAutoComplete = React.forwardRef(({
    value = "",
    suggestions = [],
    showEmptyMessage,
    emptyMessage,
    onFocus,
    onBlur,
    onChange,
    completeMethod,
    onSelect,
  }: MockAutoCompleteProps, ref: React.ForwardedRef<{
    show: () => void;
    hide: () => void;
    focus: () => void;
    search: () => void;
  }>) => {
    const [searching, setSearching] = React.useState(false);
    const [overlayVisible, setOverlayVisible] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      show: () => {
        showSpy();
        setOverlayVisible(true);
      },
      hide: () => {
        hideSpy();
        setOverlayVisible(false);
      },
      focus: vi.fn(),
      search: vi.fn(),
    }));

    React.useEffect(() => {
      if (searching) {
        setSearching(false);
      }
    }, [searching, suggestions]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ originalEvent: event, value: event.target.value });

      setTimeout(() => {
        setSearching(true);
        completeMethod?.({
          originalEvent: new Event("input"),
          query: event.target.value,
        });
      }, 0);
    };

    return (
      <div>
        <input
          aria-label="autocomplete"
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={handleInputChange}
        />
        {searching ? <span>loading</span> : null}
        {!searching && showEmptyMessage && suggestions.length === 0 ? (
          <span>{emptyMessage}</span>
        ) : null}
        {overlayVisible
          ? suggestions.map((suggestion, index) => (
              <button
                type="button"
                key={index}
                onClick={(event) => onSelect?.({ originalEvent: event, value: suggestion })}
              >
                {String(suggestion)}
              </button>
            ))
          : null}
      </div>
    );
  });

  MockAutoComplete.displayName = "MockAutoComplete";

  return { AutoComplete: MockAutoComplete };
});

function Harness() {
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>(["Ana"]);

  const handleComplete = (query: string) => {
    setSuggestions(query === "zzz" ? [] : ["Ana"]);
  };

  return (
    <AutoCompleteSeplag
      value={value}
      suggestions={suggestions}
      completeMethod={handleComplete}
      onChange={(event) => setValue((event.value as string) ?? "")}
      emptyMessage="Nenhum registro localizado"
      showEmptyMessage
    />
  );
}

function AsyncSuggestionsHarness() {
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  const handleComplete = (query: string) => {
    setTimeout(() => {
      setSuggestions(query === "ana" ? ["Ana"] : []);
    }, 0);
  };

  return (
    <AutoCompleteSeplag
      value={value}
      suggestions={suggestions}
      completeMethod={handleComplete}
      onChange={(event) => setValue((event.value as string) ?? "")}
    />
  );
}

describe("AutoCompleteSeplag", () => {
  it("encaminha o ref para o AutoComplete interno", () => {
    const ref = React.createRef<React.ComponentRef<typeof AutoCompleteSeplag>>();

    render(<AutoCompleteSeplag ref={ref} value="" suggestions={[]} />);

    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.show).toBe("function");
    expect(typeof ref.current?.hide).toBe("function");
  });

  it("mostra emptyMessage quando a busca digitada retorna vazio", async () => {
    const user = userEvent.setup();

    render(<Harness />);

    await user.clear(screen.getByRole("textbox", { name: "autocomplete" }));
    await user.type(screen.getByRole("textbox", { name: "autocomplete" }), "zzz");

    await waitFor(() => {
      expect(screen.queryByText("loading")).toBeNull();
      expect(screen.getByText("Nenhum registro localizado")).not.toBeNull();
    });
  });

  it("abre o overlay quando sugestoes assincronas chegam com o campo focado", async () => {
    const user = userEvent.setup();

    render(<AsyncSuggestionsHarness />);

    await user.type(screen.getByRole("textbox", { name: "autocomplete" }), "ana");

    await waitFor(() => {
      expect(showSpy).toHaveBeenCalled();
    });
  });

  it("mantem o overlay clicavel quando o input perde foco antes do click da sugestao", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AutoCompleteSeplag value="ana" suggestions={["Ana"]} onSelect={onSelect} />,
    );

    const input = screen.getByRole("textbox", { name: "autocomplete" });

    await user.click(input);
    const suggestion = await screen.findByRole("button", { name: "Ana" });

    fireEvent.blur(input);

    expect(screen.getByRole("button", { name: "Ana" })).not.toBeNull();
    await user.click(suggestion);

    expect(onSelect).toHaveBeenCalledOnce();
  });
});
