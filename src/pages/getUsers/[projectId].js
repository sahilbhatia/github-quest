import useSWR from "swr";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorComponent from "../components/errorpage";
import LoadingComponent from "../components/loaderpage";
import UsersOfProjectComponent from "../components/UsersOfProjectComponent";
let code;
const fetcher = (url) =>
  fetch(url).then((res) => {
    code = res.status;
    return res.json();
  });
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  const router = useRouter();
  const { projectId } = router.query;

  let { error, data } = useSWR(
    `/api/getUsersOfProject?limit=${limit}&offset=${offset}&projectId=${projectId}`,
    fetcher
  );
  if (error || code == 400 || code == 404 || code == 500)
    return <ErrorComponent code={code} />;
  if (!data) return <LoadingComponent />;

  return (
    <UsersOfProjectComponent
      limit={limit}
      offset={offset}
      setOffset={setOffset}
      setLimit={setLimit}
      data={data}
    />
  );
}
