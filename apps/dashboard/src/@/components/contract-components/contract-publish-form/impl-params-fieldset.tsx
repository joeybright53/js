import type { AbiParameter } from "abitype";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ThirdwebClient } from "thirdweb";
import { SolidityInput } from "@/components/solidity-inputs";
import { Checkbox, CheckboxWithLabel } from "@/components/ui/checkbox";
import { InlineCode } from "@/components/ui/inline-code";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTemplateValuesForType } from "@/lib/deployment/template-values";
import { RefInputImplFieldset } from "./ref-contract-impl-input/ref-input-impl-fieldset";

interface ImplementationParamsFieldsetProps {
  implParams: readonly AbiParameter[];
  client: ThirdwebClient;
}
export const ImplementationParamsFieldset: React.FC<
  ImplementationParamsFieldsetProps
> = ({ implParams, client }) => {
  const form = useFormContext();

  const isMobile = useIsMobile();

  const [isCustomInputEnabled, setIsCustomInputEnabled] = useState(
    Array(implParams.length).fill(false),
  );

  const handleToggleCustomInput = (index: number, newValue: boolean) => {
    const newIsCustomInputEnabled = [...isCustomInputEnabled];
    newIsCustomInputEnabled[index] = newValue;
    setIsCustomInputEnabled(newIsCustomInputEnabled);

    // Clear or set values accordingly when toggling between input types
    if (newValue) {
      form.setValue(
        `implConstructorParams.${implParams[index]?.name || "*"}.dynamicValue.type`,
        implParams[index]?.type,
      );
      form.setValue(
        `implConstructorParams.${implParams[index]?.name || "*"}.defaultValue`,
        "",
        {
          shouldDirty: true,
        },
      );
    } else {
      form.setValue(
        `implConstructorParams.${implParams[index]?.name || "*"}.dynamicValue.type`,
        "",
      );
      form.setValue(
        `implConstructorParams.${implParams[index]?.name || "*"}.dynamicValue`,
        "",
        {
          shouldDirty: true,
        },
      );
    }
  };

  return (
    <fieldset>
      <h2 className="font-semibold text-3xl tracking-tight">
        Implementation Contract Constructor Parameters
      </h2>
      <p className="text-muted-foreground">
        These are the parameters users will need to fill in when deploying this
        contract.
      </p>

      <div className="h-6" />

      <div className="flex flex-col gap-8">
        {implParams.map((param, idx) => {
          const paramTemplateValues = getTemplateValuesForType(param.type);
          return (
            <div
              className="rounded-lg border border-border bg-card p-6"
              key={`implementation_${param.name}`}
            >
              {/* Title + Type */}
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-xl tracking-tight">
                  {param.name ? (
                    param.name
                  ) : (
                    <span className="italic">
                      Unnamed param (will not be used)
                    </span>
                  )}
                </h3>
                <InlineCode
                  className="px-2 text-base text-muted-foreground"
                  code={param.type}
                />
              </div>
              <div className="h-5" />
              <div className="flex flex-col gap-5">
                {/* Title + Description + Switch */}
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div>
                    <h4 className="font-medium text-base"> Default Value </h4>
                    <p className="text-muted-foreground text-sm">
                      Value prefilled in deployment form
                    </p>
                  </div>
                  {(param.type === "address" ||
                    param.type === "address[]" ||
                    param.type === "bytes" ||
                    param.type === "bytes[]") && (
                    <div className="flex items-center gap-3 text-sm">
                      Dynamic Input
                      <Switch
                        checked={isCustomInputEnabled[idx]}
                        onCheckedChange={(v) => handleToggleCustomInput(idx, v)}
                      />
                    </div>
                  )}
                </div>

                {!isCustomInputEnabled[idx] ? (
                  <SolidityInput
                    className="!bg-background !text-sm placeholder:!text-sm"
                    client={client}
                    placeholder={
                      isMobile ||
                      paramTemplateValues?.[0]?.value ===
                        "{{trusted_forwarders}}"
                        ? "Pre-filled value."
                        : "This value will be pre-filled in the deploy form."
                    }
                    solidityType={param.type}
                    {...form.register(
                      `implConstructorParams.${
                        param.name ? param.name : "*"
                      }.defaultValue`,
                    )}
                  />
                ) : (
                  <RefInputImplFieldset client={client} param={param} />
                )}

                {paramTemplateValues.length > 0 &&
                  !isCustomInputEnabled[idx] &&
                  paramTemplateValues[0]?.helperText && (
                    <CheckboxWithLabel className="text-foreground">
                      <Checkbox
                        checked={
                          form.watch(
                            `implConstructorParams.${
                              param.name ? param.name : "*"
                            }.defaultValue`,
                          ) === paramTemplateValues[0]?.value
                        }
                        onCheckedChange={(v) => {
                          form.setValue(
                            `implConstructorParams.${
                              param.name ? param.name : "*"
                            }.defaultValue`,
                            v ? paramTemplateValues[0]?.value : "",
                            {
                              shouldDirty: true,
                            },
                          );
                        }}
                      />
                      {paramTemplateValues[0]?.helperText}
                    </CheckboxWithLabel>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};
