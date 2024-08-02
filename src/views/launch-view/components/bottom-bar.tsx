import { Button } from "@/components/ui/button";
import { SectionType } from "./launch-view-client";

type BottomBarProps = {
  section: SectionType;
  setSection: React.Dispatch<React.SetStateAction<SectionType>>;
};
const BottomBar = ({ section, setSection }: BottomBarProps) => {
  const buttons: SectionType[] = ["Info", "Trade"];
  return (
    <div className="sticky w-full left-0 bottom-0 flex justify-between gap-1 bg-secondary-darker">
      {buttons.map((btn) => {
        return (
          <Button
            className={` ${
              section === btn ? "bg-primary" : "bg-secondary"
            } w-full active:scale-95 rounded-none transition duration-200`}
            key={btn + "_"}
            onClick={() => setSection(btn)}
          >
            {btn}
          </Button>
        );
      })}
    </div>
  );
};

export default BottomBar;
