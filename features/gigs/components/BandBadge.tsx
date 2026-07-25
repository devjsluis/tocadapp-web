import { Users2 } from "lucide-react";

interface BandBadgeProps {
  name: string;
}

export function BandBadge({ name }: BandBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
      <Users2 size={9} />
      {name}
    </span>
  );
}
