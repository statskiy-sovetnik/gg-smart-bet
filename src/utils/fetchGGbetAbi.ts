export async function fetchGGbetAbi(): Promise<any> {
  const response = await fetch('/GGbet.json');
  const body = await response.json();
  return body.abi;
}
