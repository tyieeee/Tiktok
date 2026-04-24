"use client";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music2, CheckCheck, X, Loader2 } from "lucide-react";

type Props = {
  /** Existing handle to pre-fill (e.g. from onboarding) */
  defaultHandle?: string;
  /** Already-connected verified handle; renders a "Connected" pill with Reconnect option */
  connectedHandle?: string | null;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
};

export function ConnectTikTokButton({
  defaultHandle,
  connectedHandle,
  variant = "default",
  size = "default",
  className,
}: Props) {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState(defaultHandle ?? "");
  const connect = trpc.user.connectTikTok.useMutation({
    onSuccess: (data) => {
      utils.user.me.invalidate();
      setOpen(false);
      toast.success(
        data.videosImported > 0
          ? `Connected! Imported ${data.videosImported} videos to your portfolio.`
          : "TikTok connected"
      );
    },
    onError: (e) => toast.error(e.message ?? "Failed to connect"),
  });

  function submit() {
    const h = handle.trim().replace(/^@/, "");
    if (!h) return toast.error("Enter your TikTok handle");
    connect.mutate({ handle: h });
  }

  if (connectedHandle && !open) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        title="Reconnect TikTok"
      >
        <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
        <span className="truncate">@{connectedHandle}</span>
      </Button>
    );
  }

  if (!open) {
    return (
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <Music2 className="mr-2 h-4 w-4" />
        Connect TikTok
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          @
        </span>
        <Input
          autoFocus
          placeholder="yourhandle"
          value={handle.replace(/^@/, "")}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="w-44 pl-7"
          disabled={connect.isPending}
        />
      </div>
      <Button size={size} onClick={submit} disabled={connect.isPending}>
        {connect.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting…
          </>
        ) : (
          "Connect"
        )}
      </Button>
      <Button size="icon" variant="ghost" onClick={() => setOpen(false)} disabled={connect.isPending}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
