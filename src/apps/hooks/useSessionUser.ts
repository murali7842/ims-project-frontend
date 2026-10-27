import { useSyncExternalStore } from "react";
import { getUser, subscribeUser } from "../utils/authStorage";

// The logged in user; re-renders when the profile is updated (setUser) or on logout
export const useSessionUser = () => useSyncExternalStore(subscribeUser, getUser);
