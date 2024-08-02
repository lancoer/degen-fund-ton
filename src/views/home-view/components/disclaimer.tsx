import { cn } from "@/lib/cn";

export const Disclaimer = ({ className }: { className?: string }) => {
  return (
    <div className={cn(className, "border rounded-md p-2")}>
      <p className="text-sm text-muted text-center">
        <span className="font-semibold">Disclaimer:</span> DegenFund will never
        endorse or encourage that you invest in any of the projects listed and
        therefore, accept no liability for any loss occasioned. It is the
        user(s) responsibility to do their own research and seek financial
        advice from a professional. More information about (DYOR) can be found
        via{" "}
        <a
          className="text-primary underline"
          rel="noopener noreferrer"
          target="_blank"
          href="https://academy.binance.com/en/glossary/do-your-own-research"
        >
          Binance Academy
        </a>
        .
      </p>
    </div>
  );
};
