export function ethProviderExists(): Boolean {
  // @ts-ignore
  return Boolean(window.ethereum);
}
