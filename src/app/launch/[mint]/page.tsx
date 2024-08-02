import LaunchView from "@/views/launch-view";
import { cookies } from "next/headers";
import { Suspense } from "react";

type Props = {
  params: { mint: string };
  searchParams: any;
};
export default function Page(props: Props) {
  // disable cache for this server action
  const _cookies = cookies();

  const refUrlId = props.searchParams["r"];
  const auth = props.searchParams["t"];
  return (
    <LaunchView mint={props.params.mint} refUrlId={refUrlId} auth={auth} />
  );
}
