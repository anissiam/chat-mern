import {create} from "zustand";
import {createAuthSlice} from "@/store/slices/auth-slice.js";
import {createChatSlice} from "@/store/slices/chat-slice.js";

export const useAppStore = create()((...a) => ({
    ...createAuthSlice(...a),
    ...createChatSlice(...a)
}))