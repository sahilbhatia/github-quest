import useSWR from "swr";
import { useRouter } from "next/router";
import ErrorComponent from "../../../components/errorpage";
import LoadingComponent from "../../../components/loaderpage";
import ProjectsOfUserComponent from "../../../components/ProjectsOfUserComponent";
let code;
const fetcher = (url) =>
  fetch(url).then((res) => {
    code = res.status;
    return res.json();
  });
export default function Index() {
  const router = useRouter();
  const { userId } = router.query;
  let { data, error } = useSWR(`/api/user-projects?&userId=${userId}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500)
    return <ErrorComponent code={code} />;
  if (!data) return <LoadingComponent />;

  return <ProjectsOfUserComponent data={data} />;
}
