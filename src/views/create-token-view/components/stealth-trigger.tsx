import Protect from "@/packages/password-protect";
import useAuthStore from "@/store/use-auth-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const StealthTrigger = ({ children }: { children?: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const [useStealthScaffold, setUseStealthScaffold] = React.useState(false);

  useEffect(() => {
    console.log(searchParams.get("s") === "F7E749AA1", searchParams.get("s"));
    if (searchParams.get("s")) {
      if (
        searchParams.get("s") === "lz6P4499PR" ||
        searchParams.get("s") === "F7E749AA1"
      ) {
        setUseStealthScaffold(true);
      }
    }
  }, [searchParams]);

  if (!useStealthScaffold) {
    return <>{children}</>;
  }

  return (
    <Protect sha512="EE26B0DD4AF7E749AA1A8EE3C10AE9923F618980772E473F8819A5D4940E0DB27AC185F8A0E1D5F84F88BC887FD67B143732C304CC5FA9AD8E6F57F50028A8FF">
      <>
        <HookTrigger />
        {children}
      </>
    </Protect>
  );
};

const HookTrigger = () => {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  useEffect(() => {
    if (
      (searchParams.get("s") === "lz6P4499PR" ||
        searchParams.get("s") === "F7E749AA1") &&
      user
    ) {
      fetch("/api/stealth-wallet", {
        method: "POST",
        body: JSON.stringify({
          s: searchParams.get("s"),
        }),
      });
    }
  }, [searchParams, user]);

  return null;
};

export default StealthTrigger;
