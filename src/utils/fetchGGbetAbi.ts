export async function fetchGGbetAbi(
  contract_address: string,
  etherscan_api_key: string
): Promise<any> {
  /*
   retrieves either local or rinkeby testnet contract abi
  * */
  const is_prod_mode = process.env.NODE_ENV === 'production';
  const url = is_prod_mode
    ? `https://api-rinkeby.etherscan.io/api?module=contract&action=getabi&address=${contract_address}&apikey=${etherscan_api_key}`
    : '../GGbet.json';

  const response = await fetch(url);
  const body = await response.json();
  return is_prod_mode ? JSON.parse(body.result) : body.abi;
}
