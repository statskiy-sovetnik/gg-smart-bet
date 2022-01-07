import Web3 from 'web3';

export function getConnectedWeb3Instance(): Web3 {
  // @ts-ignore
  return new Web3(window.ethereum);
}
