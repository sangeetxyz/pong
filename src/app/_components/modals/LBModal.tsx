import React, { memo, useEffect, useState, type FC } from "react";
import { Button } from "../ui/button";
import { MdLeaderboard } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { api } from "@/trpc/react";
import { formatLargeNumber, formatSeconds, truncateAddress } from "@/lib/utils";

const LeaderboardModal = memo(() => {
  const { data, refetch } = api.token.getLeaderboardDetails.useQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      void refetch();
    }
  }, [open, refetch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"secondary"}
          className="flex aspect-square justify-center p-0"
        >
          <MdLeaderboard className="" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/50 p-2 backdrop-blur-lg">
        <DialogHeader className="hidden">
          <DialogTitle>{}</DialogTitle>
          <DialogDescription>{}</DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col space-y-4">
          <div className="px-2 text-xl font-bold italic">
            Pong<span className="text-lime-400">01</span>{" "}
            <span className="not-itali font-normal"> rankings</span>
          </div>
          {data && <LeaderboardTable data={data} />}
        </div>
      </DialogContent>
    </Dialog>
  );
});

LeaderboardModal.displayName = "LeaderboardModal";

export default LeaderboardModal;

type TLeaderboardTableProps = {
  data: {
    walletAddress: string;
    highScore: number;
    longestSurvival: number;
    pongTokenCount: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

const LeaderboardTable: FC<TLeaderboardTableProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
      <Table className="font-[400]">
        <TableHeader>
          <TableRow className="">
            <TableHead className="w-[20px]">Rank</TableHead>
            <TableHead className="text-center">Player</TableHead>
            <TableHead className="text-center">Top Survival</TableHead>
            <TableHead className="text-center"> High Score</TableHead>
            <TableHead className="text-right text-lime-400">$PONG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.walletAddress}>
              <TableCell className="pl-4 text-xs font-medium">
                #{index + 1}
              </TableCell>
              <TableCell className="text-center text-xs">
                {truncateAddress(row.walletAddress)}
              </TableCell>
              <TableCell className="text-center text-xs">
                {formatSeconds(row.longestSurvival)}
              </TableCell>
              <TableCell className="text-center text-xs">
                {formatLargeNumber(row.highScore)}
              </TableCell>
              <TableCell className="pr-4 text-end text-xs">
                {formatLargeNumber(row.pongTokenCount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        {/* <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total Net Profit</TableCell>
            <TableCell className="text-right">{totalNetProfit}</TableCell>
          </TableRow>
        </TableFooter> */}
      </Table>
    </div>
  );
};
