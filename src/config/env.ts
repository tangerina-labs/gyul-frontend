export const IS_PLAYWRIGHT_TEST =
  typeof window !== "undefined" &&
  (window as Window & { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__;
export const SHOW_DEV_TOOLS = import.meta.env.DEV && !IS_PLAYWRIGHT_TEST;
