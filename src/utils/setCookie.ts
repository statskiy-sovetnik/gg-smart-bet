export function setCookie(name: string, value: string, expires?: Date): void {
  const expires_param = expires ? '; expires=' + expires.toUTCString() : '';
  document.cookie = `${name}=${value}` + expires_param;
}
