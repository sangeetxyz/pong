// hooks/useReferral.ts
import { api } from "@/trpc/react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import useAuth from "./useAuth";

export const useReferral = () => {
  const { user } = useAuth();
  const addReferralMutation = api.token.addReferral.useMutation();
  const { data: referralStats, refetch: refetchReferralStats } =
    api.token.getReferralStats.useQuery();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get("ref");
    if (
      referralCode &&
      referralCode.length === 42 &&
      !localStorage.getItem("pendingReferral")
    ) {
      localStorage.setItem("pendingReferral", referralCode);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("ref")) {
      url.searchParams.delete("ref");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const processPendingReferral = useCallback(async () => {
    if (!user?.id) return;
    const pendingReferral = localStorage.getItem("pendingReferral");

    if (!pendingReferral || addReferralMutation.isPending) return;

    try {
      const result = await addReferralMutation.mutateAsync({
        referrerAddress: pendingReferral,
      });

      if (result.success) {
        if (!!result.message) {
          toast.success(result.message);
        }
        localStorage.removeItem("pendingReferral");
      } else {
        if (!!result.message) {
          toast.error(result.message);
        }
        localStorage.removeItem("pendingReferral");
      }
    } catch (error) {
      toast.error("Failed to process referral");
    }
  }, [addReferralMutation]);

  const generateReferralLink = () => {
    if (referralStats?.referralLink) {
      return referralStats.referralLink;
    }
    return null;
  };

  const shareReferralLink = async () => {
    const link = generateReferralLink();
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Pong Game!",
          text: "Play this awesome ping pong game and earn tokens!",
          url: link,
        });
      } catch (error) {
        await navigator.clipboard.writeText(link);
        toast.success("Referral link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(link);
      toast.success("Referral link copied to clipboard!");
    }
  };

  return {
    referralStats,
    refetchReferralStats,
    processPendingReferral,
    generateReferralLink,
    shareReferralLink,
    isLoading: addReferralMutation.isPending,
  };
};
