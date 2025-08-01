import type { AbiParameterToPrimitiveType } from "abitype";
import { decodeAbiParameters } from "viem";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "royaltyInfo" function.
 */
export type RoyaltyInfoParams = {
  tokenId: AbiParameterToPrimitiveType<{ type: "uint256"; name: "tokenId" }>;
  salePrice: AbiParameterToPrimitiveType<{
    type: "uint256";
    name: "salePrice";
  }>;
};

export const FN_SELECTOR = "0x2a55205a" as const;
const FN_INPUTS = [
  {
    name: "tokenId",
    type: "uint256",
  },
  {
    name: "salePrice",
    type: "uint256",
  },
] as const;
const FN_OUTPUTS = [
  {
    name: "receiver",
    type: "address",
  },
  {
    name: "royaltyAmount",
    type: "uint256",
  },
] as const;

/**
 * Checks if the `royaltyInfo` method is supported by the given contract.
 * @param availableSelectors An array of 4byte function selectors of the contract. You can get this in various ways, such as using "whatsabi" or if you have the ABI of the contract available you can use it to generate the selectors.
 * @returns A boolean indicating if the `royaltyInfo` method is supported.
 * @extension ERC2981
 * @example
 * ```ts
 * import { isRoyaltyInfoSupported } from "thirdweb/extensions/erc2981";
 * const supported = isRoyaltyInfoSupported(["0x..."]);
 * ```
 */
export function isRoyaltyInfoSupported(availableSelectors: string[]) {
  return detectMethod({
    availableSelectors,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Encodes the parameters for the "royaltyInfo" function.
 * @param options - The options for the royaltyInfo function.
 * @returns The encoded ABI parameters.
 * @extension ERC2981
 * @example
 * ```ts
 * import { encodeRoyaltyInfoParams } from "thirdweb/extensions/erc2981";
 * const result = encodeRoyaltyInfoParams({
 *  tokenId: ...,
 *  salePrice: ...,
 * });
 * ```
 */
export function encodeRoyaltyInfoParams(options: RoyaltyInfoParams) {
  return encodeAbiParameters(FN_INPUTS, [options.tokenId, options.salePrice]);
}

/**
 * Encodes the "royaltyInfo" function into a Hex string with its parameters.
 * @param options - The options for the royaltyInfo function.
 * @returns The encoded hexadecimal string.
 * @extension ERC2981
 * @example
 * ```ts
 * import { encodeRoyaltyInfo } from "thirdweb/extensions/erc2981";
 * const result = encodeRoyaltyInfo({
 *  tokenId: ...,
 *  salePrice: ...,
 * });
 * ```
 */
export function encodeRoyaltyInfo(options: RoyaltyInfoParams) {
  // we do a "manual" concat here to avoid the overhead of the "concatHex" function
  // we can do this because we know the specific formats of the values
  return (FN_SELECTOR +
    encodeRoyaltyInfoParams(options).slice(
      2,
    )) as `${typeof FN_SELECTOR}${string}`;
}

/**
 * Decodes the result of the royaltyInfo function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension ERC2981
 * @example
 * ```ts
 * import { decodeRoyaltyInfoResult } from "thirdweb/extensions/erc2981";
 * const result = decodeRoyaltyInfoResultResult("...");
 * ```
 */
export function decodeRoyaltyInfoResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result);
}

/**
 * Calls the "royaltyInfo" function on the contract.
 * @param options - The options for the royaltyInfo function.
 * @returns The parsed result of the function call.
 * @extension ERC2981
 * @example
 * ```ts
 * import { royaltyInfo } from "thirdweb/extensions/erc2981";
 *
 * const result = await royaltyInfo({
 *  contract,
 *  tokenId: ...,
 *  salePrice: ...,
 * });
 *
 * ```
 */
export async function royaltyInfo(
  options: BaseTransactionOptions<RoyaltyInfoParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.tokenId, options.salePrice],
  });
}
