import type { AbiParameterToPrimitiveType } from "abitype";
import { decodeAbiParameters } from "viem";
import { readContract } from "../../../../../transaction/read-contract.js";
import type { BaseTransactionOptions } from "../../../../../transaction/types.js";
import { encodeAbiParameters } from "../../../../../utils/abi/encodeAbiParameters.js";
import { detectMethod } from "../../../../../utils/bytecode/detectExtension.js";
import type { Hex } from "../../../../../utils/encoding/hex.js";

/**
 * Represents the parameters for the "getRoleMember" function.
 */
export type GetRoleMemberParams = {
  role: AbiParameterToPrimitiveType<{ type: "bytes32"; name: "role" }>;
  index: AbiParameterToPrimitiveType<{ type: "uint256"; name: "index" }>;
};

export const FN_SELECTOR = "0x9010d07c" as const;
const FN_INPUTS = [
  {
    name: "role",
    type: "bytes32",
  },
  {
    name: "index",
    type: "uint256",
  },
] as const;
const FN_OUTPUTS = [
  {
    type: "address",
  },
] as const;

/**
 * Checks if the `getRoleMember` method is supported by the given contract.
 * @param availableSelectors An array of 4byte function selectors of the contract. You can get this in various ways, such as using "whatsabi" or if you have the ABI of the contract available you can use it to generate the selectors.
 * @returns A boolean indicating if the `getRoleMember` method is supported.
 * @extension PERMISSIONS
 * @example
 * ```ts
 * import { isGetRoleMemberSupported } from "thirdweb/extensions/permissions";
 * const supported = isGetRoleMemberSupported(["0x..."]);
 * ```
 */
export function isGetRoleMemberSupported(availableSelectors: string[]) {
  return detectMethod({
    availableSelectors,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
  });
}

/**
 * Encodes the parameters for the "getRoleMember" function.
 * @param options - The options for the getRoleMember function.
 * @returns The encoded ABI parameters.
 * @extension PERMISSIONS
 * @example
 * ```ts
 * import { encodeGetRoleMemberParams } from "thirdweb/extensions/permissions";
 * const result = encodeGetRoleMemberParams({
 *  role: ...,
 *  index: ...,
 * });
 * ```
 */
export function encodeGetRoleMemberParams(options: GetRoleMemberParams) {
  return encodeAbiParameters(FN_INPUTS, [options.role, options.index]);
}

/**
 * Encodes the "getRoleMember" function into a Hex string with its parameters.
 * @param options - The options for the getRoleMember function.
 * @returns The encoded hexadecimal string.
 * @extension PERMISSIONS
 * @example
 * ```ts
 * import { encodeGetRoleMember } from "thirdweb/extensions/permissions";
 * const result = encodeGetRoleMember({
 *  role: ...,
 *  index: ...,
 * });
 * ```
 */
export function encodeGetRoleMember(options: GetRoleMemberParams) {
  // we do a "manual" concat here to avoid the overhead of the "concatHex" function
  // we can do this because we know the specific formats of the values
  return (FN_SELECTOR +
    encodeGetRoleMemberParams(options).slice(
      2,
    )) as `${typeof FN_SELECTOR}${string}`;
}

/**
 * Decodes the result of the getRoleMember function call.
 * @param result - The hexadecimal result to decode.
 * @returns The decoded result as per the FN_OUTPUTS definition.
 * @extension PERMISSIONS
 * @example
 * ```ts
 * import { decodeGetRoleMemberResult } from "thirdweb/extensions/permissions";
 * const result = decodeGetRoleMemberResultResult("...");
 * ```
 */
export function decodeGetRoleMemberResult(result: Hex) {
  return decodeAbiParameters(FN_OUTPUTS, result)[0];
}

/**
 * Calls the "getRoleMember" function on the contract.
 * @param options - The options for the getRoleMember function.
 * @returns The parsed result of the function call.
 * @extension PERMISSIONS
 * @example
 * ```ts
 * import { getRoleMember } from "thirdweb/extensions/permissions";
 *
 * const result = await getRoleMember({
 *  contract,
 *  role: ...,
 *  index: ...,
 * });
 *
 * ```
 */
export async function getRoleMember(
  options: BaseTransactionOptions<GetRoleMemberParams>,
) {
  return readContract({
    contract: options.contract,
    method: [FN_SELECTOR, FN_INPUTS, FN_OUTPUTS] as const,
    params: [options.role, options.index],
  });
}
