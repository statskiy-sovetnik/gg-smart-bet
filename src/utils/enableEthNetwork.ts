export function enableEthNetwork(): Promise<boolean> {
  //@ts-ignore
  return window.ethereum.send('eth_requestAccounts');
}
