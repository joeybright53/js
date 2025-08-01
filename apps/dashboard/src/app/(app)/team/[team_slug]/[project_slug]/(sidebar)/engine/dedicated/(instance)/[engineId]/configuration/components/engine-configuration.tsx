"use client";

import type { EngineInstance } from "@/hooks/useEngine";
import { EngineCorsConfig } from "./cors";
import { EngineWalletConfig } from "./engine-wallet-config";
import { EngineIpAllowlistConfig } from "./ip-allowlist";
import { EngineSystem } from "./system";

interface EngineConfigurationProps {
  instance: EngineInstance;
  teamSlug: string;
  projectSlug: string;
  authToken: string;
}

export const EngineConfiguration: React.FC<EngineConfigurationProps> = ({
  instance,
  teamSlug,
  projectSlug,
  authToken,
}) => {
  return (
    <div>
      <EngineWalletConfig
        authToken={authToken}
        instance={instance}
        projectSlug={projectSlug}
        teamSlug={teamSlug}
      />
      <div className="space-y-8">
        <EngineCorsConfig authToken={authToken} instanceUrl={instance.url} />
        <EngineIpAllowlistConfig
          authToken={authToken}
          instanceUrl={instance.url}
        />
        <EngineSystem
          instance={instance}
          projectSlug={projectSlug}
          teamIdOrSlug={teamSlug}
        />
      </div>
    </div>
  );
};
