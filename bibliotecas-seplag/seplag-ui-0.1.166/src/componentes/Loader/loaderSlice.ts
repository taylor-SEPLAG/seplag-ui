import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const DEFAULT_MESSAGE = "Carregando";

const initialState = {
  count: 0,
  message: DEFAULT_MESSAGE,
};

export const loaderSliceSeplag = createSlice({
  name: "loader",
  initialState,
  reducers: {
    incrementLoaderSeplag: {
      reducer: (state, action: PayloadAction<string>) => {
        state.count += 1;
        state.message = action.payload;
      },
      prepare: (message?: string) => ({
        payload: message || DEFAULT_MESSAGE,
      }),
    },
    decrementLoaderSeplag: (state) => {
      state.count -= 1;
      if (state.count <= 0) {
        state.count = 0;
        state.message = DEFAULT_MESSAGE;
      }
    },
  },
});

export const { incrementLoaderSeplag, decrementLoaderSeplag } = loaderSliceSeplag.actions;
