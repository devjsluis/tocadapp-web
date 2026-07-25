import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const TOKEN_CHANGE_EVENT = "auth-token-changed";

const notifyTokenChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
  }
};

export const tokenStorage = {
  get: (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
  },

  set: (token: string): void => {
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    notifyTokenChange();
  },

  remove: (): void => {
    Cookies.remove(TOKEN_KEY);
    notifyTokenChange();
  },

  has: (): boolean => {
    return Boolean(Cookies.get(TOKEN_KEY));
  },

  subscribe: (callback: () => void): (() => void) => {
    window.addEventListener(TOKEN_CHANGE_EVENT, callback);

    return () => {
      window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
    };
  },
};
