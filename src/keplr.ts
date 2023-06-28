import {
  CosmosDidStore,
  SaoKeplrAccountProvider,
  SidManager,
} from "@saonetwork/sid";
import { ModelManager } from "storverse-sao-model";

declare const window: any;
export type ConnectWallet = {
  modelManager: any;
  provider: any;
  config: SaoConfig;
  sid: string;
  token: string;
};

export class SaoConfig {
  constructor(
    public readonly chainId: string,
    public readonly chainName: string,
    public readonly api: string,
    public readonly rpc: string,
    public readonly nodeApiUrl: string,
    public readonly platformId: string,
    public readonly nodeDid: string[],
    public readonly graphUrl: string,
  ) { }
}

export async function handleConnect(config: SaoConfig) {
  const sm = await getSidManager(config)
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.log(error.message);
      return error.message;
    });

  if (typeof sm == "string") {
    if (
      sm.includes(
        "Could not broadcast Tx: Account does not exist on chain. Send some tokens there before trying to query sequence"
      )
    ) {
      return 1;
    } else {
      return false;
    }
  } else {
    const provider: any = await sm.getSidProvider();

    const sid = provider.sid;

    const modelManager = await getModelManager(sid, sm, config);

    const clientProposal = await provider.createJWS({
      payload: sid,
    });
  
    const token = `${clientProposal.payload}:${clientProposal.signatures[0].protected}:${clientProposal.signatures[0].signature}`;

    window.connectWallet = {
      modelManager,
      provider,
      config,
      sid,
      token
    };

    return true;
  }
}

export function getConnectedWallet(): ConnectWallet {
  const { modelManager, provider, config, sid, token } = window.connectWallet || {};

  if (!modelManager || !provider || !config || !sid || !token) {
    throw new Error("Keplr wallet not found.");
  }

  return {
    modelManager,
    provider,
    config,
    sid,
    token,
  };
}

const getSidManager = async (config: SaoConfig) => {
  if (window.keplr) {
    await suggestSaoNetworkChain(config);
    await window.keplr.enable(config.chainId);
    const offlineSigner = await window.getOfflineSigner(config.chainId);
    const didStore = new CosmosDidStore(offlineSigner, config.api, config.rpc);
    const accountProvider = await SaoKeplrAccountProvider.new(
      window.keplr,
      config.chainId
    );
    const manager = await SidManager.createManager(accountProvider, didStore);
    return manager;
  } else {
    throw new Error("Keplr wallet not found.");
  }
};


const suggestSaoNetworkChain = async (config: SaoConfig) => {
  await window.keplr.experimentalSuggestChain({
    chainId: config.chainId,
    chainName: config.chainName,
    rpc: config.rpc,
    rest: config.api,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "sao",
      bech32PrefixAccPub: "saopub",
      bech32PrefixValAddr: "saovaloper",
      bech32PrefixValPub: "saovaloperpub",
      bech32PrefixConsAddr: "saovalcons",
      bech32PrefixConsPub: "saovalconspub",
    },
    currencies: [
      {
        coinDenom: "sao",
        coinMinimalDenom: "sao",
        coinDecimals: 0,
        coinGeckoId: "sao",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "sao",
        coinMinimalDenom: "sao",
        coinDecimals: 0,
        coinGeckoId: "sao",
        gasPriceStep: {
          low: 0.01,
          average: 0.025,
          high: 0.04,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: "sao",
      coinMinimalDenom: "sao",
      coinDecimals: 0,
      coinGeckoId: "sao",
    },
  });
};

const getModelManager = async (ownerDid: string, sidManager: any, config: SaoConfig) => {
  await window.keplr.enable(config.chainId);
  const offlineSigner = await window.getOfflineSigner(config.chainId);
  const manager = new ModelManager(
    {
      ownerDid,
      chainApiUrl: config.api,
      chainApiToken: "TOKEN",
      chainRpcUrl: config.rpc,
      chainPrefix: "sao",
      signer: offlineSigner,
      nodeApiUrl: config.nodeApiUrl,
      nodeApiToken: "TOKEN",
      platformId: config.platformId,
    },
    sidManager,
    {
      duration: 365 * 60 * 60 * 24,
      replica: 1,
      timeout: 60,
      operation: 1,
      isPublish: false,
    }
  );
  await manager.init();

  try {
    await manager.loadModel("0");
  } catch {
    // return null
  }

  return manager;
};
