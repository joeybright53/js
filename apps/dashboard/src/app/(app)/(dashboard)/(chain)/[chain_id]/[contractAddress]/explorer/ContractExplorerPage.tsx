import type { Abi } from "abitype";
import { CircleAlertIcon } from "lucide-react";
import type { ThirdwebContract } from "thirdweb";
import type { ChainMetadata } from "thirdweb/chains";
import { getContractFunctionsFromAbi } from "@/components/contract-components/getContractFunctionsFromAbi";
import { ContractFunctionsPanel } from "@/components/contracts/functions/contract-function";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContractExplorePageProps {
  contract: ThirdwebContract;
  abi: Abi | undefined;
  chainMetadata: ChainMetadata;
  isLoggedIn: boolean;
}

export const ContractExplorerPage: React.FC<ContractExplorePageProps> = ({
  contract,
  abi,
  chainMetadata,
  isLoggedIn,
}) => {
  if (!abi) {
    return (
      <Alert variant="destructive">
        <CircleAlertIcon className="size-5" />
        <AlertTitle>Failed to resolve contract ABI</AlertTitle>
        <AlertDescription>
          Please verify that contract address is correct and deployed on "
          {chainMetadata.name}" chain.
        </AlertDescription>
      </Alert>
    );
  }

  const functions = getContractFunctionsFromAbi(abi);
  return (
    <div className="flex h-[70vh] flex-col">
      {functions && functions.length > 0 ? (
        <ContractFunctionsPanel
          contract={contract}
          fnsOrEvents={functions}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 bg-card text-center">
          <h2 className="font-semibold text-2xl tracking-tight">
            No callable functions discovered in ABI.
          </h2>
          <p className="text-muted-foreground text-sm">
            Please note that proxy contracts are not yet supported in the
            explorer, check back soon for full proxy support.
          </p>
        </div>
      )}
    </div>
  );
};
