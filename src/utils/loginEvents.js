export const notifyLoginSuccess = () => {
  try {
    window.dispatchEvent(new CustomEvent("loginSuccess"));
  } catch {
    // no-op
  }
};
