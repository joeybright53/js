// keep in line with product SKUs in the backend
export type ProductSKU =
  | "plan:starter"
  | "plan:growth"
  | "plan:custom"
  | "plan:accelerate"
  | "plan:scale"
  | "plan:pro"
  | "product:ecosystem_wallets"
  | "product:engine_standard"
  | "product:engine_premium"
  | "usage:storage"
  | "usage:in_app_wallet"
  | "usage:aa_sponsorship"
  | "usage:aa_sponsorship_op_grant"
  | null;

export type ChainInfraSKU =
  | "chain:infra:rpc"
  | "chain:infra:insight"
  | "chain:infra:account_abstraction";
