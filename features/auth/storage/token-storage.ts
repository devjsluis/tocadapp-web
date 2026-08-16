import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_CHANGE_EVENT = "auth-token-changed";

const notifyTokenChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
  }
};

export const tokenStorage = {
  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
      expires: 1,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    notifyTokenChange();
  },

  setAccessToken: (token: string): void => {
    Cookies.set(ACCESS_TOKEN_KEY, token, {
      expires: 1,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    notifyTokenChange();
  },

  remove: (): void => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);

    notifyTokenChange();
  },

  has: (): boolean => {
    return Boolean(
      Cookies.get(ACCESS_TOKEN_KEY) || Cookies.get(REFRESH_TOKEN_KEY),
    );
  },

  subscribe: (callback: () => void): (() => void) => {
    window.addEventListener(TOKEN_CHANGE_EVENT, callback);

    return () => {
      window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
    };
  },

  // Compatibilidad temporal si algún archivo sigue usando get()
  get: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_KEY);
  },
};
