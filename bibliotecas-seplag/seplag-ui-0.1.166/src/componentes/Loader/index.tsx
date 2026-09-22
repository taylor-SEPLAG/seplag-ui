import { useAppSelectorSeplag } from "../../app/hook/hooks";
import { loaderSeplag } from "./loaderContent";

export function LoaderSeplag(props: Readonly<{ text?: string }>) {
  const isLoading = useAppSelectorSeplag((state) => state.loaderReducer.count) > 0;
  const message = useAppSelectorSeplag((state) => state.loaderReducer.message) || props.text;

  return isLoading ? loaderSeplag(message) : null;
}
