import { Address } from 'viem';

const HOST = 'https://compound-multiplier-backend-dev.woof.software';

export enum FlashLoanProvider {
  MORPHO = 'morpho',
  AAVE_V3 = 'aaveV3',
  BALANCER_V2 = 'balancerV2',
  EULER_V2 = 'eulerV2',
}

export type FlashLoanRecord = {
  protocol: FlashLoanProvider; // A name of the loan provider
  reserves: bigint; // Available token reserves on the loan provider
  fee: number; // The fee of the loan provider
  decimals: number; // to convert loan reserves to the number
  pluginSelector: string; // TODO: the key is temporary and have to be changed to match the real property after it will be added to the backend
}

export type FetchOptions = {
  signal: AbortSignal;
}

export type FetchFlashloansArgs = {
  /**
   * The blockchain network to fetch flash loans from.
   */
  chainId: number;

  /**
   *  Actually, the server must determine a valid loan provider on its own. However, if there
   *  is a demand to retrieve reserves for a specific protocol, then the `protocol` property can be used.
   */
  protocol?: FlashLoanProvider;

  /**
   * Array of token addresses to include in the request.
   */
  assets: string[];
}

/**
 * Fetches flash loan details from a specified blockchain and protocol with given collateral tokens.
 *
 * Utilizes GET /v1/flashloans/{chain} route
 *
 * Usage:
 * - It is used to identify and mark which collaterals can be multiplied on the dashboard's collateral list once the
 * user begins their journey with the Multiplier feature.
 *
 * @return A promise that resolves to an object containing loan records mapped by their identifiers.
 *
 * @throws {Error} Throws an error if the request fails or the response is not successful.
 */
export async function fetchFlashLoans(params: FetchFlashloansArgs): Promise<Record<string, FlashLoanRecord>> {
  const { chainId, protocol, assets } = params;

  const url = new URL(`${HOST}/v1/flashloans/${chainId}`);

  if (protocol) {
    url.searchParams.append('protocol', protocol);
  }

  assets.forEach((collateral) => {
    url.searchParams.append('tokenAddresses', collateral);
  });

  const resp = await fetch(url, {
    method: 'GET'
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch loans: ${resp.statusText}`);
  }

  type LoansResponse = {
    data: {
      [p: string]: FlashLoanRecord;
    }
  }

  const { data } = await resp.json() as LoansResponse;

  const transformed = {} as Record<string, FlashLoanRecord>;

  for (const key in data) {
    const { reserves, ...other } = data[key];

    transformed[key] = {
      reserves: BigInt(reserves),
      ...other
    };
  }

  return transformed;
}

/**
 * Represents the status record of fetched agreements, including details about their signed and unsigned states.
 */
export type FetchAgreementsStatusRecord = {
  /**
   * Indicates whether the agreement has been signed by the specified address.
   */
  isSigned: boolean;
  /**
   * The agreement text with timestamp addition for signing. Only returned when isSigned is false. Contains the same data as /current endpoint.
   */
  unsignedText?: string;
  /**
   * ISO timestamp when the agreement was signed. Only returned when isSigned is true.
   */
  signedAt?: Date;
  /**
   * Current signing date (rounded to minute) for cryptographic signing. Only returned when isSigned is false. Contains the same data as /current endpoint.
   */
  unsignedAt?: Date;
  /**
   * UUID of the last agreement that needs to be signed. Only returned when isSigned is false. Contains the same data as /current endpoint.
   */
  unsignedId?: string;
}

/**
 * Fetches the status of agreements for a given wallet address.
 *
 * @param walletAddress - The wallet address for which the agreement status needs to be fetched.
 * @return A promise that resolves to an object containing the agreements' statuses.
 * @throws {Error} Throws an error if the request fails.
 */
export async function fetchAgreementsStatus(walletAddress: string): Promise<FetchAgreementsStatusRecord> {
  const url = new URL(`${HOST}/v1/agreements/status/${walletAddress}`);

  const resp = await fetch(url, {
    method: 'GET'
  });

  if (!resp.ok) {
    throw new Error(`Failed to get agreement status: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Represents an agreement's current record with its associated details.
 */
export type FetchAgreementCurrentRecord = {
  /**
   * The textual description or content of the agreement record.
   */
  text: string
  /**
   * The timestamp when the agreement record was created
   */
  time: Date
  /**
   * The unique identifier of the agreement record.
   */
  id: string
}

/**
 * Fetches the current agreement data from the API.
 *
 * @return A promise that resolves to a record containing the current agreement data.
 *
 * @throws {Error} Throws an error if the request fails.
 */
export async function fetchAgreementCurrent(): Promise<FetchAgreementCurrentRecord> {
  const url = new URL(`${HOST}/v1/agreements/current`);

  const resp = await fetch(url, {
    method: 'GET'
  });

  if (!resp.ok) {
    throw new Error(`Failed to get current agreement: ${resp.statusText}`);
  }

  return resp.json();
}

/**
 * Represents the arguments required to post a signed agreement.
 * This type is used to define the details necessary when a signed agreement is submitted.
 */
export type PostAgreementSignArgs = {
  /**
   * A unique identifier for the agreement being signed.
   */
  agreementId: string;
  /**
   * A string representation of the signed agreement content.
   */
  signedAgreement: string;
  /**
   * The date and time when the agreement was signed.
   */
  signedAt: Date;
  /**
   * The address of the signer who signed the agreement.
   */
  signerAddress: Address
}

/**
 * Sends a POST request to sign an agreement with the provided parameters.
 *
 * @param params - The parameters required to sign the agreement, including necessary agreement details.
 * @return A promise that resolves when the agreement is successfully signed. Rejects with an error if the request fails.
 *
 * @throws {Error} Throws an error if the request fails.
 */
export async function postAgreementSign(params: PostAgreementSignArgs) {
  const url = new URL(`${HOST}/v1/agreements/sign`);

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!resp.ok) {
    throw new Error(`Failed to sign agreement: ${resp.statusText}`);
  }

  return resp.json();
}

export enum SwapTool {
  INCH = '1inch'
}

export enum SwapAggregator {
  LIFI = 'lifi',
  OKX = 'okx'
}

export type FetchQuoteToArgs = {
  fromTokenAddress: string; // asset to be spent
  toTokenAddress: string; // asset to be received
  userAddress: string; // receiver address

  /**
   * Chain ID of the blockchain network to perform the swap on.
   */
  chain: number;

  /**
   * Regardless of the direction of the exchange, the FROM token is always the token the user wants to send, while the
   * TO token is the token the user receives. However, there is a difference in the `amount` property. Depending on the
   * API, you may use something like a 'direct' and 'reversed' swap.
   *
   * Using 'direct' swap, the `amount` means the number of the FROM token the user wants to send. But using 'reversed'
   * swap, the `amount` means the number of the TO token the user wants to receive.
   *
   * So, check the API you are using always to get to know what the `amount` means in your case.
   */
  amount: string;

  excludeDexs?: FlashLoanProvider[];

  /**
   * Slippage value as float 0, 0.1, 10, 100 and etc.
   */
  slippage?: number;

  /**
   * The `swapTool` and `aggregator` fields should generally not be used. The server should
   * determine the specific tool and aggregator. But if there is a real need to lock them, you
   * may do that through the specified params.
   */
  swapTool?: SwapTool;
  aggregator?: SwapAggregator;
}

export type SwapQuote = {
  aggregator: SwapAggregator;

  /**
   * Current contracts implementation uses unique IDs (HEX values). These IDs are used to determine
   * which swap provider will be used by smart-contract to perform the swap. So, this property is stored
   * by the server and returned within response to make it possible to interact with a contract from
   * the client.
   */
  pluginSelector: string;
  tool: SwapTool;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  minToAmount: string;

  /**
   * The fee amount is taken by the swap provider and paid with the FROM token.
   */
  feeAmount?: string;
  callData: CallData;

  /**
   * The property will be returned only for some aggregators. Check the back end documentation for more details.
   */
  priceImpactPercent?: number;
}

export type CallData = {
  from: string;
  to: string;
  chainId: number;
  data: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
}

/**
 * Fetches a swap quote which is used to perform a swap on the smart contract.
 *
 * This is a 'direct' swap which `amount` is the number of the FROM token the user wants to send.
 *
 * @param args - An object containing query parameters to be sent with the request.
 * @param options
 * @return A promise that resolves to a Quote object containing the fetched quote details.
 */
export async function fetchQuoteFrom(args: FetchQuoteToArgs, options?: FetchOptions): Promise<SwapQuote> {
  const url = new URL(`${HOST}/v1/swaps/quote/from-amount`);

  for (const [key, value] of Object.entries(args)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, `${item}`);
      }
    } else {
      url.searchParams.set(key, `${value}`);
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    signal: options?.signal
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reversed quote: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Represents the platform fee configuration returned by the backend.
 */
export type GetPlatformFeeResponse = {
  /**
   * Indicates whether the platform fee is currently enabled.
   */
  enabled: boolean;

  /**
   * The percentage fee taken by the platform.
   * Value is represented in range 0 ... 100.
   */
  percent: number;

  /**
   * The address where the collected platform fees are sent.
   */
  feeRecipientAddress: Address;
}

/**
 * Fetches the current platform fee configuration from the API.
 *
 * @return A promise that resolves to an object containing the platform fee configuration.
 *
 */
export async function getPlatformFee(): Promise<GetPlatformFeeResponse> {
  const url = new URL(`${HOST}/v1/system/platform-fee`);

  const resp = await fetch(url, {
    method: 'GET'
  });

  if (!resp.ok) {
    throw new Error(`Failed to get platform fee: ${resp.statusText}`);
  }

  return resp.json();
}