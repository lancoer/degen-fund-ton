import Image from "next/image";

const OngearLogo = () => {
  return (
    <div className="flex items-center gap-1">
      <Image
        src="/assets/logo2.png"
        alt="logo"
        className="w-[44px] h-[44px]"
        height={44}
        width={44}
      />

      <h1 className="text-xl font-bold text-primary">PumpPink</h1>
    </div>
  );
};

export default OngearLogo;
