"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { CircleXIcon, EllipsisIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ThirdwebClient } from "thirdweb";
import { z } from "zod";
import { BillingPortalButton } from "@/components/billing/billing";
import { DangerSettingCard } from "@/components/blocks/DangerSettingCard";
import { FileInput } from "@/components/blocks/FileInput";
import { SettingsCard } from "@/components/blocks/SettingsCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import type { Account } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { resolveSchemeWithErrorHandler } from "@/utils/resolveSchemeWithErrorHandler";

type MinimalAccount = Pick<
  Account,
  "name" | "email" | "emailConfirmedAt" | "unconfirmedEmail" | "image"
>;

export function AccountSettingsPageUI(props: {
  account: MinimalAccount;
  sendEmail: (email: string) => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateEmailWithOTP: (otp: string) => Promise<void>;
  updateAccountAvatar: (avatar: File | undefined) => Promise<void>;
  client: ThirdwebClient;
  deleteAccount: DeleteAccount;
  onAccountDeleted: () => void;
  defaultTeamSlug: string;
  defaultTeamName: string;
  cancelSubscriptions: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <AccountNameFormControl
        name={props.account.name || ""}
        updateName={(name) => props.updateName(name)}
      />
      <AccountAvatarFormControl
        avatar={props.account.image || undefined}
        client={props.client}
        updateAccountAvatar={props.updateAccountAvatar}
      />
      <AccountEmailFormControl
        email={props.account.email || ""}
        sendEmail={props.sendEmail}
        status={props.account.emailConfirmedAt ? "verified" : "unverified"}
        updateEmailWithOTP={props.updateEmailWithOTP}
      />

      <DeleteAccountCard
        cancelSubscriptions={props.cancelSubscriptions}
        defaultTeamName={props.defaultTeamName}
        defaultTeamSlug={props.defaultTeamSlug}
        deleteAccount={props.deleteAccount}
        onAccountDeleted={props.onAccountDeleted}
      />
    </div>
  );
}

function AccountAvatarFormControl(props: {
  updateAccountAvatar: (avatar: File | undefined) => Promise<void>;
  avatar: string | undefined;
  client: ThirdwebClient;
}) {
  const accountAvatarUrl = resolveSchemeWithErrorHandler({
    client: props.client,
    uri: props.avatar,
  });
  const [avatar, setAvatar] = useState<File>();
  const updateAvatarMutation = useMutation({
    mutationFn: (_avatar: File | undefined) => {
      return props.updateAccountAvatar(_avatar);
    },
  });

  function handleSave() {
    const promises = updateAvatarMutation.mutateAsync(avatar);
    toast.promise(promises, {
      error: "Failed to update account avatar",
      success: "Account avatar updated successfully",
    });
  }

  return (
    <SettingsCard
      bottomText="An avatar is optional but strongly recommended."
      errorText={undefined}
      noPermissionText={undefined}
      saveButton={{
        disabled: false,
        isPending: updateAvatarMutation.isPending,
        onClick: handleSave,
      }}
    >
      <div className="flex flex-row gap-4 md:justify-between">
        <div>
          <h3 className="font-semibold text-xl tracking-tight">Avatar</h3>
          <p className="mt-1.5 mb-4 text-foreground text-sm leading-relaxed">
            This is your account's avatar. <br /> Click on the avatar to upload
            a custom one
          </p>
        </div>
        <FileInput
          accept={{ "image/*": [] }}
          className="w-20 rounded-full lg:w-28"
          client={props.client}
          disableHelperText
          setValue={setAvatar}
          value={avatar || accountAvatarUrl}
        />
      </div>
    </SettingsCard>
  );
}

function AccountNameFormControl(props: {
  name: string;
  updateName: (name: string) => Promise<void>;
}) {
  const [accountName, setAccountName] = useState(props.name);
  const maxAccountNameLength = 32;

  const updateAccountNameMutation = useMutation({
    mutationFn: props.updateName,
  });

  function handleSave() {
    const promises = updateAccountNameMutation.mutateAsync(accountName);
    toast.promise(promises, {
      error: "Failed to update account name",
      success: "Account name updated successfully",
    });
  }

  return (
    <SettingsCard
      bottomText={`Please use ${maxAccountNameLength} characters at maximum.`}
      errorText={undefined}
      header={{
        description: "This is your account's name displayed on thirdweb",
        title: "Display Name",
      }}
      noPermissionText={undefined}
      saveButton={{
        disabled: accountName.length === 0,
        isPending: updateAccountNameMutation.isPending,
        onClick: handleSave,
      }} // TODO
    >
      <Input
        className="md:w-[400px]"
        onChange={(e) => {
          setAccountName(e.target.value.slice(0, maxAccountNameLength));
        }}
        value={accountName}
      />
    </SettingsCard>
  );
}

type DeleteAccount = () => Promise<{
  status: number;
}>;

// TODO: when user can create multiple teams - the error status messaging needs to be updated

function DeleteAccountCard(props: {
  deleteAccount: DeleteAccount;
  onAccountDeleted: () => void;
  defaultTeamSlug: string;
  defaultTeamName: string;
  cancelSubscriptions: () => Promise<void>;
}) {
  const title = "Delete Account";
  const description = (
    <>
      Permanently delete your thirdweb account, the default team "
      {props.defaultTeamName}" and all associated data
      <br />
      This action is not reversible
    </>
  );

  const deleteAccount = useMutation({
    mutationFn: props.deleteAccount,
    onSuccess: (data) => {
      if (data.status === 200) {
        props.onAccountDeleted();
        toast.success("Account deleted successfully");
      } else {
        toast.error("Failed to delete account");
      }
    },
  });

  const cancelSubscriptions = useMutation({
    mutationFn: props.cancelSubscriptions,
  });

  function handleDelete() {
    deleteAccount.mutate();
  }

  return (
    <DangerSettingCard
      buttonLabel={title}
      buttonOnClick={handleDelete}
      confirmationDialog={{
        children: (
          <>
            {deleteAccount.data?.status === 400 && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <AlertTitle>Failed to delete account</AlertTitle>
                  <AlertDescription>
                    <div className="mb-4">
                      <span className="block">
                        Your default team "{props.defaultTeamName}" has active
                        subscriptions. These subscriptions have to be cancelled
                        before deleting account
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row">
                      <Button
                        className="gap-2"
                        onClick={() => {
                          const promise = cancelSubscriptions.mutateAsync();
                          toast.promise(promise, {
                            error: "Failed to cancel subscriptions",
                            success: "Subscriptions cancelled successfully",
                          });
                        }}
                        size="sm"
                        variant="default"
                      >
                        {cancelSubscriptions.isPending ? (
                          <Spinner className="size-4" />
                        ) : (
                          <CircleXIcon className="size-4" />
                        )}
                        Cancel subscriptions
                      </Button>

                      <Button
                        asChild
                        className="gap-2"
                        size="sm"
                        variant="outline"
                      >
                        <Link
                          href="/team/~/~/support"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Contact Support
                          <ExternalLinkIcon className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {deleteAccount.data?.status === 402 && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <AlertTitle>Failed to delete account</AlertTitle>
                  <AlertDescription>
                    <span className="mb-4 block">
                      Your default team "{props.defaultTeamName}" has unpaid
                      invoices. These invoices have to be paid before deleting
                      account
                    </span>
                    <BillingPortalButton
                      buttonProps={{
                        size: "sm",
                        variant: "default",
                      }}
                      teamSlug={props.defaultTeamSlug}
                    >
                      Manage Billing
                    </BillingPortalButton>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        ),
        description: (
          <span className="block space-y-2">
            <span className="block">
              Permanently delete your thirdweb account, the default team "
              {props.defaultTeamName}" and all associated data
            </span>
            <span className="block font-medium">
              This action is not reversible
            </span>
          </span>
        ),
        onClose: () => {
          deleteAccount.reset();
        },
        title: "Delete Account",
      }}
      description={description}
      isPending={deleteAccount.isPending}
      title={title}
    />
  );
}

function AccountEmailFormControl(props: {
  email: string;
  status: "unverified" | "verified";
  sendEmail: (email: string) => Promise<void>;
  updateEmailWithOTP: (otp: string) => Promise<void>;
}) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  return (
    <SettingsCard
      bottomText="Emails must be verified to be able to login with them or be used as primary email"
      errorText={undefined}
      header={{
        description:
          "Enter the email address you want to use to log in with thirdweb. This email will be used for account related notifications",
        title: "Email",
      }}
      noPermissionText={undefined}
    >
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
        {/* Start */}
        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
          <p className="text-sm"> {props.email}</p>
          <Badge
            className="capitalize "
            variant={props.status === "unverified" ? "outline" : "default"}
          >
            {props.status}
          </Badge>
        </div>

        {/* End */}
        <Dialog onOpenChange={setIsEmailModalOpen} open={isEmailModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="!h-auto !w-auto p-1.5"
              size="icon"
              variant="ghost"
            >
              <EllipsisIcon className="size-5 text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <EmailUpdateDialogContent
              currentEmail={props.email}
              onSuccess={() => {
                setIsEmailModalOpen(false);
              }}
              sendEmail={props.sendEmail}
              updateEmailWithOTP={props.updateEmailWithOTP}
            />
          </DialogContent>
        </Dialog>
      </div>
    </SettingsCard>
  );
}

const emailUpdateFormSchema = z.object({
  email: z.string().min(1, "Email can not be empty").max(100),
});

function EmailUpdateDialogContent(props: {
  currentEmail: string;
  sendEmail: (email: string) => Promise<void>;
  updateEmailWithOTP: (otp: string) => Promise<void>;
  onSuccess: () => void;
}) {
  const [isEmailSent, setIsEmailSent] = useState(false);

  if (isEmailSent) {
    return (
      <EnterEmailOTP
        onSuccess={props.onSuccess}
        updateEmailWithOTP={props.updateEmailWithOTP}
      />
    );
  }

  return (
    <SendEmailOTP
      currentEmail={props.currentEmail}
      onEmailSent={() => setIsEmailSent(true)}
      sendEmail={props.sendEmail}
    />
  );
}

function SendEmailOTP(props: {
  onEmailSent: () => void;
  currentEmail: string;
  sendEmail: (email: string) => Promise<void>;
}) {
  const form = useForm<z.infer<typeof emailUpdateFormSchema>>({
    resolver: zodResolver(emailUpdateFormSchema),
    values: {
      email: props.currentEmail,
    },
  });

  const [showSendError, setShowSendError] = useState(false);
  const sendEmail = useMutation({
    mutationFn: props.sendEmail,
  });

  function onSubmit(values: z.infer<typeof emailUpdateFormSchema>) {
    sendEmail.mutateAsync(values.email, {
      onError: (e) => {
        console.error(e);
        setShowSendError(true);
      },
      onSuccess: () => {
        props.onEmailSent();
      },
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 p-6 pb-10">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-2xl">Update Email</DialogTitle>
            <DialogDescription>
              A confirmation email will be sent to verify email address
            </DialogDescription>
          </DialogHeader>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setShowSendError(false);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {showSendError && (
                  <p className="text-destructive-text">
                    {sendEmail.error?.message || "Failed to send email"}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className="gap-4 border-t bg-card p-6 lg:gap-1">
          <DialogClose asChild>
            <Button variant="outline"> Cancel </Button>
          </DialogClose>
          <Button
            className="min-w-24 gap-2"
            disabled={!form.formState.isDirty}
            type="submit"
          >
            {sendEmail.isPending && <Spinner className="size-4" />}
            Update
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EnterEmailOTP(props: {
  updateEmailWithOTP: (otp: string) => Promise<void>;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [showOTPError, setShowOTPError] = useState(false);
  const updateEmail = useMutation({
    mutationFn: props.updateEmailWithOTP,
    onError: () => {
      setShowOTPError(true);
    },
    onSuccess: () => {
      props.onSuccess();
      toast.success("Email updated successfully");
    },
  });

  return (
    <div>
      <div className="flex flex-col p-6 pb-10">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-2xl">Update Email</DialogTitle>
          <DialogDescription>
            Enter the OTP sent to new email address
          </DialogDescription>
        </DialogHeader>

        <div className="h-6" />

        <InputOTP
          disabled={updateEmail.isPending}
          inputMode="text"
          maxLength={6}
          onChange={(v) => {
            setOtp(v);
            setShowOTPError(false);
          }}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={otp}
        >
          <InputOTPGroup className="w-full">
            {new Array(6).fill(0).map((_, idx) => (
              <InputOTPSlot
                className={cn("h-12 grow text-lg", {
                  "border-red-500": showOTPError,
                })}
                index={idx}
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                key={idx}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {showOTPError && (
          <p className="mt-3 text-center text-destructive-text">
            Failed to verify email with this OTP
          </p>
        )}
      </div>

      <DialogFooter className="gap-4 border-t bg-card p-6 lg:gap-1">
        <DialogClose asChild>
          <Button variant="outline"> Cancel </Button>
        </DialogClose>
        <Button
          className="min-w-24 gap-2"
          onClick={() => {
            updateEmail.mutate(otp);
          }}
        >
          {updateEmail.isPending && <Spinner className="size-4" />}
          Verify
        </Button>
      </DialogFooter>
    </div>
  );
}
