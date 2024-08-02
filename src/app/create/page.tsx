import CreateTokenView from "@/views/create-token-view";
import { cookies } from "next/headers";

export default function Page() {
  // disable cache for this server action
  const _cookies = cookies();

  return <CreateTokenView />;
}
