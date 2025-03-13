import { useState } from "react";
import { LuCopy } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa6";

const CopyButton = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn(className, "focus:outline-none")}
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 5000);
      }}
    >
      {isCopied ? <FaCheck size={14} /> : <LuCopy size={14} />}
    </button>
  );
};

export default CopyButton;
