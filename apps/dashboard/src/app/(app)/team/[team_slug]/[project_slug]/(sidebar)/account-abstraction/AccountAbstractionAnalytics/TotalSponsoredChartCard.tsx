"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { ThirdwebBarChart } from "@/components/blocks/charts/bar-chart";
import { DocLink } from "@/components/blocks/DocLink";
import { ExportToCSVButton } from "@/components/blocks/ExportToCSVButton";
import type { ChartConfig } from "@/components/ui/chart";
import { useAllChainsData } from "@/hooks/chains/allChains";
import { DotNetIcon } from "@/icons/brand-icons/DotNetIcon";
import { ReactIcon } from "@/icons/brand-icons/ReactIcon";
import { TypeScriptIcon } from "@/icons/brand-icons/TypeScriptIcon";
import { UnityIcon } from "@/icons/brand-icons/UnityIcon";
import { UnrealIcon } from "@/icons/brand-icons/UnrealIcon";
import type { UserOpStats } from "@/types/analytics";
import { toUSD } from "@/utils/number";

type ChartData = Record<string, number> & {
  time: string; // human readable date
};

export function TotalSponsoredChartCard(props: {
  userOpStats: UserOpStats[];
  isPending: boolean;
}) {
  const { userOpStats } = props;
  const topChainsToShow = 10;
  const chainsStore = useAllChainsData();

  const { chartConfig, chartData } = useMemo(() => {
    const _chartConfig: ChartConfig = {};
    const _chartDataMap: Map<string, ChartData> = new Map();
    const chainIdToVolumeMap: Map<string, number> = new Map();
    // for each stat, add it in _chartDataMap
    for (const stat of userOpStats) {
      const chartData = _chartDataMap.get(stat.date);
      const { chainId } = stat;
      const chain = chainsStore.idToChain.get(Number(chainId));

      // if no data for current day - create new entry
      if (!chartData) {
        _chartDataMap.set(stat.date, {
          time: stat.date,
          [chain?.name || chainId || "Unknown"]: stat.sponsoredUsd,
        } as ChartData);
      } else {
        chartData[chain?.name || chainId || "Unknown"] =
          (chartData[chain?.name || chainId || "Unknown"] || 0) +
          stat.sponsoredUsd;
      }

      chainIdToVolumeMap.set(
        chain?.name || chainId || "Unknown",
        stat.sponsoredUsd + (chainIdToVolumeMap.get(chainId || "Unknown") || 0),
      );
    }

    const chainsSorted = Array.from(chainIdToVolumeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((w) => w[0]);

    const chainsToShow = chainsSorted.slice(0, topChainsToShow);
    const chainsToTagAsOthers = chainsSorted.slice(topChainsToShow);

    // replace chainIdsToTagAsOther chainId with "other"
    for (const data of _chartDataMap.values()) {
      for (const chainId in data) {
        if (chainsToTagAsOthers.includes(chainId)) {
          data.others = (data.others || 0) + (data[chainId] || 0);
          delete data[chainId];
        }
      }
    }

    chainsToShow.forEach((walletType, i) => {
      _chartConfig[walletType] = {
        color: `hsl(var(--chart-${(i % 10) + 1}))`,
        label: chainsToShow[i],
      };
    });

    // Add Other
    chainsToShow.push("others");
    _chartConfig.others = {
      color: "hsl(var(--muted-foreground))",
      label: "Others",
    };

    return {
      chartConfig: _chartConfig,
      chartData: Array.from(_chartDataMap.values()).sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }),
    };
  }, [userOpStats, chainsStore]);

  const uniqueChainIds = Object.keys(chartConfig);
  const disableActions =
    props.isPending ||
    chartData.length === 0 ||
    chartData.every((data) => data.sponsoredUsd === 0);

  return (
    <ThirdwebBarChart
      chartClassName="aspect-[1] lg:aspect-[3.5]"
      config={chartConfig}
      customHeader={
        <div className="relative px-6 pt-6">
          <h3 className="mb-0.5 font-semibold text-xl tracking-tight">
            Gas Sponsored
          </h3>
          <p className="text-muted-foreground text-sm">
            The total amount of gas sponsored in USD
          </p>

          <div className="top-6 right-6 mt-4 mb-4 grid grid-cols-2 items-center gap-2 md:absolute md:my-0 md:flex">
            <ExportToCSVButton
              className="bg-background"
              disabled={disableActions}
              fileName="Gas Sponsored"
              getData={async () => {
                // Shows the number of each type of wallet connected on all dates
                const header = ["Date", ...uniqueChainIds];
                const rows = chartData.map((data) => {
                  const { time, ...rest } = data;
                  return [
                    time,
                    ...uniqueChainIds.map((w) => (rest[w] || 0).toString()),
                  ];
                });
                return { header, rows };
              }}
            />
          </div>
        </div>
      }
      data={chartData}
      emptyChartState={<TotalSponsoredChartCardEmptyChartState />}
      hideLabel={false}
      isPending={props.isPending}
      showLegend
      toolTipLabelFormatter={(_v, item) => {
        if (Array.isArray(item)) {
          const time = item[0].payload.time as number;
          return format(new Date(time), "MMM d, yyyy");
        }
        return undefined;
      }}
      toolTipValueFormatter={(value) => {
        if (typeof value !== "number") {
          return "";
        }

        return toUSD(value);
      }}
      variant="stacked"
    />
  );
}

function TotalSponsoredChartCardEmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="mb-6 text-lg">Sponsor gas for your users</span>
      <div className="flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <DocLink
          icon={TypeScriptIcon}
          label="TypeScript"
          link="https://portal.thirdweb.com/typescript/v5/account-abstraction/get-started"
        />
        <DocLink
          icon={ReactIcon}
          label="React"
          link="https://portal.thirdweb.com/react/v5/account-abstraction/get-started"
        />
        <DocLink
          icon={ReactIcon}
          label="React Native"
          link="https://portal.thirdweb.com/react/v5/account-abstraction/get-started"
        />
        <DocLink
          icon={UnityIcon}
          label="Unity"
          link="https://portal.thirdweb.com/unity/v5/wallets/account-abstraction"
        />
        <DocLink
          icon={UnrealIcon}
          label="Unreal Engine"
          link="https://portal.thirdweb.com/unreal-engine/blueprints/smart-wallet"
        />
        <DocLink
          icon={DotNetIcon}
          label=".NET"
          link="https://portal.thirdweb.com/dotnet/wallets/providers/account-abstraction"
        />
      </div>
    </div>
  );
}
