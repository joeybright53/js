import type { Address } from "abitype";
import type { BaseTransactionOptions } from "../../../transaction/types.js";
import type { Prettify } from "../../../utils/type-utils.js";
import { toUnits } from "../../../utils/units.js";
import { approve as generatedApprove } from "../__generated__/IERC20/write/approve.js";

/**
 * Represents the parameters for the `approve` function.
 * @extension ERC20
 */
export type ApproveParams = Prettify<
  { spender: Address } & (
    | {
        amount: number | string;
      }
    | {
        amountWei: bigint;
      }
  )
>;

/**
 * Approves the spending of tokens by a specific address.
 * @param options - The transaction options.
 * @returns A prepared transaction object.
 * @extension ERC20
 * @example
 * ```ts
 * import { approve } from "thirdweb/extensions/erc20";
 * import { sendTransaction } from "thirdweb";
 *
 * const transaction = await approve({
 *  contract,
 *  spender: "0x...",
 *  amount: 100,
 * });
 *
 * await sendTransaction({ transaction, account });
 * ```
 */
export function approve(options: BaseTransactionOptions<ApproveParams>) {
  return generatedApprove({
    asyncParams: async () => {
      let amount: bigint;
      if ("amount" in options) {
        // if we need to parse the amount from ether to gwei then we pull in the decimals extension
        const { decimals } = await import("../read/decimals.js");
        // if this fails we fall back to `18` decimals
        const d = await decimals(options).catch(() => 18);
        // turn ether into gwei
        amount = toUnits(options.amount.toString(), d);
      } else {
        amount = options.amountWei;
      }
      return {
        overrides: {
          erc20Value: {
            amountWei: amount,
            tokenAddress: options.contract.address,
          },
        },
        spender: options.spender,
        value: amount,
      } as const;
    },
    contract: options.contract,
  });
}
