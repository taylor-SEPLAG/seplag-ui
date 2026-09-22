import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

export const useAppDispatchSeplag: () => AppDispatch = useDispatch;
export const useAppSelectorSeplag: TypedUseSelectorHook<RootState> = useSelector;
