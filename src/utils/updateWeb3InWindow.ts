import {ethProviderExists} from '@/utils/ethProviderExists';
import {getConnectedWeb3Instance} from '@/utils/getConnectedWeb3Instance';
import {enableEthNetwork} from '@/utils/enableEthNetwork';

export async function updateWeb3InWindow() {
  if (ethProviderExists()) {
    await enableEthNetwork();
    // @ts-ignore
    window.web3 = getConnectedWeb3Instance();
  }
}
