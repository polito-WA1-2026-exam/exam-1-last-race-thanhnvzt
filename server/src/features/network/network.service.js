import { listNetworkForSetup } from './network.dao.js';
import { mapSetupNetwork } from './network.mapper.js';

export async function getSetupNetwork() {
  return mapSetupNetwork(await listNetworkForSetup());
}
