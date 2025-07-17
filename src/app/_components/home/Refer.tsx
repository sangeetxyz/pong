import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useReferral } from "@/hooks/useReferral";
import { Button } from "../ui/button";
import { Share2, Gift, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

const Refer = () => {
  const { referralStats, shareReferralLink, refetchReferralStats } =
    useReferral();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void refetchReferralStats();
  }, [refetchReferralStats, open]);

  if (!referralStats?.canShareReferral) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <div className="absolute bottom-4 right-4 flex cursor-pointer items-center space-x-1 rounded-xl bg-zinc-950/30 px-3 py-2 backdrop-blur-lg">
          <div className="text-xs">
            Earn more{" "}
            <span className="font-bold uppercase text-lime-500">$pong</span>{" "}
            with Referrals
          </div>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            <div className="text-xl font-bold italic">
              Pong<span className="text-lime-400">01</span>{" "}
              <span className="not-itali font-normal">referrals</span>
            </div>
          </SheetTitle>
          <SheetDescription>
            Share your referral link to earn bonus tokens when friends play!
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col">
          <div className="mt-8 flex space-x-4">
            <div className="w-full rounded-xl border bg-zinc-900 p-2 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {referralStats.totalReferrals}
              </div>
              <div className="text-xs font-medium text-gray-500">Total</div>
            </div>
            <div className="w-full rounded-xl border bg-zinc-900 p-2 text-center">
              <div className="text-2xl font-bold text-green-600">
                {referralStats.successfulReferrals}
              </div>
              <div className="text-xs font-medium text-gray-500">
                Successful
              </div>
            </div>
            <div className="w-full rounded-xl border bg-zinc-900 p-2 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {referralStats.pendingReferrals}
              </div>
              <div className="text-xs font-medium text-gray-500">Pending</div>
            </div>
          </div>

          <div className="flex flex-col pt-6">
            <div className="text-sm font-medium text-zinc-200">
              Referral Link
            </div>
            <input
              className="mt-2 truncate rounded-xl border bg-zinc-900 p-3 text-sm text-zinc-400 focus:outline-none"
              defaultValue={referralStats.referralLink}
            />
            <Button
              onClick={shareReferralLink}
              className="mt-4 flex w-full items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Referral Link
            </Button>
            <Link href="https://testnet.huddle01.com" passHref>
              <Button
                variant={"outline"}
                onClick={shareReferralLink}
                className="mt-4 flex w-full items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Claim your Points on Huddle01
              </Button>
            </Link>
          </div>

          <div className="my-6 border-t border-dashed" />

          <div className="rounded-xl border bg-zinc-900 p-3">
            <div className="mb-2 flex items-center gap-2 font-medium text-zinc-100">
              <Gift className="h-4 w-4" />
              Referral Rewards
            </div>
            <div className="space-y-1 text-sm text-zinc-300">
              <div>
                • Referees get <strong>2x points</strong> for their first game
              </div>
              <div>
                • You get <strong>3x bonus</strong> of their first game score
              </div>
              <div>• Rewards are credited automatically</div>
            </div>
          </div>

          {referralStats.pendingReferrals > 0 && (
            <div className="mt-6 rounded-xl border bg-zinc-900 p-3">
              <div className="mb-1 flex items-center gap-2 font-medium text-orange-700">
                <Clock className="h-4 w-4" />
                Pending Referrals
              </div>
              <div className="text-sm text-orange-600">
                {referralStats.pendingReferrals} user(s) signed up but
                haven&apos;t played their first game yet.
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Refer;
