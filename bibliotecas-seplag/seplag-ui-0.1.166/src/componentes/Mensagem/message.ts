import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store/store";

export interface MessageSeplagProps {
  message: string;
  type: "success" | "info" | "warn" | "error" | undefined;
}
const initialState: MessageSeplagProps = {
  message: "",
  type: "success",
};

export const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<MessageSeplagProps>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
  },
});

export const { setMessage } = messageSlice.actions;

export const selectMessage = (state: RootState) => state.messageReducer;
