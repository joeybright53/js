import type { Address } from "abitype";
import type * as ox__TypedData from "ox/TypedData";
import type { Hex, SignableMessage } from "viem";
import type { Chain } from "../../chains/types.js";
import type { ThirdwebClient } from "../../client/client.js";
import type {
  AuthorizationRequest,
  SignedAuthorization,
} from "../../transaction/actions/eip7702/authorization.js";
import type {
  EIP712TransactionOptions,
  PreparedTransaction,
} from "../../transaction/prepare-transaction.js";
import type { SerializableTransaction } from "../../transaction/serialize-transaction.js";
import type { SendTransactionResult } from "../../transaction/types.js";
import type { GetCapabilitiesResult } from "../eip5792/get-capabilities.js";
import type {
  SendCallsOptions,
  SendCallsResult,
} from "../eip5792/send-calls.js";
import type {
  GetCallsStatusResponse,
  WalletSendCallsId,
} from "../eip5792/types.js";
import type { WalletEmitter } from "../wallet-emitter.js";
import type {
  CreateWalletArgs,
  WalletAutoConnectionOption,
  WalletConnectionOption,
  WalletId,
} from "../wallet-types.js";

export type SendTransactionOption = SerializableTransaction & {
  chainId: number;
  eip712?: EIP712TransactionOptions;
};

type SendRawTransactionOptions = {
  rawTransaction: Hex;
  chainId: number;
};

type WatchAssetParams = {
  type: "ERC20";
  options: {
    address: Address;
    symbol: string;
    decimals: number;
    image?: string | undefined;
  };
};

/**
 * Wallet interface
 */
export type Wallet<TWalletId extends WalletId = WalletId> = {
  /**
   * Unique identifier of the wallet
   *
   * For example, MetaMask wallet id is `"io.metamask"`
   *
   * @example
   * ```ts
   * const wallet = createWallet("io.metamask");
   * console.log(wallet.id); // "io.metamask"
   * ```
   */
  id: TWalletId;

  /**
   * Get the [`Chain`](https://portal.thirdweb.com/references/typescript/v5/Chain) object of the network that the wallet is currently connected to.
   * If the wallet is not connected, it returns `undefined`.
   *
   * @example
   * ```ts
   * const chain = wallet.getChain();
   * ```
   */
  getChain(): Chain | undefined;
  /**
   * Get the [`Account`](https://portal.thirdweb.com/references/typescript/v5/Account) object that the wallet is currently connected to.
   * If the wallet is not connected, it returns `undefined`.
   *
   * Refer to [Account vs Wallet](https://portal.thirdweb.com/typescript/v5/wallets) to understand the difference between `Account` and `Wallet` interface
   * @example
   * ```ts
   * const account = wallet.getAccount();
   * ```
   */
  getAccount(): Account | undefined;

  /**
   * Re-connect the wallet automatically without prompting the user for connection.
   *
   * This is useful to automatically connect the wallet if it was already connected in the past to reconnect wallet when user re-visits the website after some time or refreshes the page.
   * @param options - Options to auto-connect the wallet
   */
  autoConnect(options: WalletAutoConnectionOption<TWalletId>): Promise<Account>;
  /**
   * Prompt the user to connect the wallet.
   * @param options - Options to connect the wallet. Depending on the wallet id, The options can be different.
   */
  connect(options: WalletConnectionOption<TWalletId>): Promise<Account>;
  /**
   * Disconnect the wallet
   */
  disconnect(): Promise<void>;
  /**
   * Switch the wallet to a different network by passing the [`Chain`](https://portal.thirdweb.com/references/typescript/v5/Chain) object of the network
   * @param chain -
   * The [`Chain`](https://portal.thirdweb.com/references/typescript/v5/Chain) object of the network to switch to.
   *
   * You can create a `Chain` object using the [`defineChain`](https://portal.thirdweb.com/references/typescript/v5/defineChain) function.
   * At minimum, you need to pass the `id` of the blockchain to `defineChain` function to create a `Chain` object.
   */
  switchChain(chain: Chain): Promise<void>;

  /**
   * Subscribe to wallet for certain events like `chainChanged`, `accountChanged`, `disconnect`, etc.
   *
   * @example
   * ```ts
   * wallet.subscribe("chainChanged", (chain) => {
   *  console.log("wallet is now connected to network:", chain);
   * })
   *
   * wallet.subscribe("accountChanged", (account) => {
   * console.log("wallet is now connected to account:", account);
   * })
   *
   * wallet.subscribe("disconnect", () => {
   * console.log("wallet is disconnected");
   * })
   * ```
   */
  subscribe: WalletEmitter<TWalletId>["subscribe"];

  /**
   * Get the configuration options that the wallet was created with
   *
   * @example
   * ```ts
   * const someOptions = { ... }
   * const wallet = createWallet("io.metamask", someOptions);
   *
   * const config = wallet.getConfig();
   * // config === someOptions
   * ```
   */
  getConfig: () => CreateWalletArgs<TWalletId>[1];

  // OPTIONAL

  /**
   * Can be used to execute any pre-connection actions like showing a modal, etc.
   */
  onConnectRequested?: () => Promise<void>;

  /**
   * Get the admin account of this wallet
   * This is useful for smart wallets to get the underlying personal account
   */
  getAdminAccount?: () => Account | undefined;

  /**
   * Get the authentication token for the wallet.
   *
   * This method is not available for on all wallets. This method will be `undefined` if the wallet does not support it.
   * @example
   * ```ts
   * const authToken = await wallet.getAuthToken();
   * ```
   */
  getAuthToken?: () => string | null;
};
/**
 * Account interface
 *
 * Refer to [Account vs Wallet](https://portal.thirdweb.com/typescript/v5/wallets) to understand the difference between `Account` and `Wallet` interface
 */
export type Account = {
  // REQUIRED

  /**
   * address of the account
   */
  address: Address;
  /**
   * Send the given transaction to the blockchain
   * @example
   * ```ts
   * const txResult = await account.sendTransaction(tx);
   * ```
   */
  sendTransaction: (
    tx: SendTransactionOption,
  ) => Promise<SendTransactionResult>;
  /**
   * Sign the given message and return the signature
   * @example
   * ```ts
   * const signature = await account.signMessage({ message: 'hello!' });
   * ```
   */
  signMessage: ({
    message,
    originalMessage,
    chainId,
  }: {
    message: SignableMessage;
    originalMessage?: string;
    chainId?: number;
  }) => Promise<Hex>;
  /**
   * Sign the given typed data and return the signature
   * @example
   * ```ts
   * const signature = await account.signTypedData(typedData)
   * ```
   */
  signTypedData: <
    const typedData extends ox__TypedData.TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData,
  >(
    _typedData: ox__TypedData.Definition<typedData, primaryType>,
  ) => Promise<Hex>;

  // OPTIONAL

  /**
   * Sign the given EIP-7702 authorization object.
   * @example
   * ```ts
   * const signedAuthorization = await account.signAuthorization({ address: "0x...", chainId: 1, nonce: 1n });
   * ```
   */
  signAuthorization?: (
    authorization: AuthorizationRequest,
  ) => Promise<SignedAuthorization>;

  /**
   * Estimate the gas required to execute the given transaction.
   *
   * This method is not available for on all wallets. This method will be `undefined` if the wallet does not support it.
   * @example
   * ```ts
   * if (account.estimateGas) {
   *  const gas = await account.estimateGas(tx);
   * }
   * ```
   */
  estimateGas?: (tx: PreparedTransaction) => Promise<bigint>;
  /**
   * Sign the given transaction and return the signature
   *
   * This method is not available on all wallets. This method will be `undefined` if the wallet does not support it.
   * @example
   * ```ts
   * if (account.signTransaction) {
   *  const signature = await account.signTransaction(tx);
   * }
   * ```
   */
  signTransaction?: (tx: SerializableTransaction) => Promise<Hex>;
  /**
   * Send the given array of transactions to the blockchain in a single batch
   *
   * This method is not available for on all wallets. This method will be `undefined` if the wallet does not support it.
   * @example
   * ```ts
   * if (account.sendBatchTransaction) {
   *  const txResult = await account.sendBatchTransaction([tx1, tx2, tx3]);
   * }
   * ```
   */
  sendBatchTransaction?: (
    txs: SendTransactionOption[],
  ) => Promise<SendTransactionResult>;
  /**
   * Send the given raw transaction to the blockchain
   *
   * This method is not available for on all wallets. This method will be `undefined` if the wallet does not support it.
   * @example
   * ```ts
   * if (account.sendRawTransaction) {
   *  const txResult = await account.sendRawTransaction(rawTx);
   * }
   * ```
   */
  sendRawTransaction?: (
    tx: SendRawTransactionOptions,
  ) => Promise<SendTransactionResult>;
  /**
   * Used to do any pre-transaction actions like showing a confirmation modal, etc.
   * @returns
   */
  onTransactionRequested?: (
    // biome-ignore lint/suspicious/noExplicitAny: any transaction type is allowed here
    transaction: PreparedTransaction<any>,
  ) => Promise<void>;
  /**
   * Add an asset to the wallet's watchlist.
   * @param asset - The asset to watch.
   *
   * @example
   * ```ts
   * if (account.watchAsset) {
   *  const success = await account.watchAsset({ type: "ERC20", options: { address: "0x...", symbol: "...", decimals: 18 } });
   * }
   * ```
   */
  watchAsset?: (asset: WatchAssetParams) => Promise<boolean>;

  /**
   * EIP-5792: Send the given array of calls via the wallet provider
   */
  sendCalls?: (
    calls: Omit<SendCallsOptions, "wallet">,
  ) => Promise<Omit<SendCallsResult, "wallet">>;
  /**
   * EIP-5792: Get the status of the given call bundle
   */
  getCallsStatus?: (options: {
    id: WalletSendCallsId;
    chain: Chain;
    client: ThirdwebClient;
  }) => Promise<GetCallsStatusResponse>;
  /**
   * EIP-5792: Get the capabilities of the wallet
   */
  getCapabilities?: (options: {
    chainId?: number;
  }) => Promise<GetCapabilitiesResult>;
};
