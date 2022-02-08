export function getCookie(name: string): string | undefined {
  return document.cookie.split(';').find((pair: string) => {
    return pair.startsWith(name);
  });
}
