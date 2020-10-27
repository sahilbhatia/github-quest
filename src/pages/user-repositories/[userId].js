import useSWR from "swr";
import { useRouter } from "next/router";
import { useState, useReducer } from "react";
import ErrorComponent from "../components/errorpage";
import LoadingComponent from "../components/loaderpage";
import UserRepositoryComponent from "../components/UserRepositoryComponent";
import moment from "moment";
let code;
const fetcher = (url) =>
  fetch(url).then((res) => {
    code = res.status;
    return res.json();
  });
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
  let [arr, setArr] = useState([]);
  const [invalidRepo, setInvalidRepo] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      list: [],
      show: false,
    }
  );
  const router = useRouter();
  const { userId } = router.query;
  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map((key) => {
      filterString += "&" + key + "=" + filterObject[key];
    });
    return filterString;
  };
  let { data, error } = useSWR(
    `/api/user-repositories?limit=${limit}&offset=${offset}&userId=${userId}${getQueryString(
      filter
    )}`,
    fetcher
  );
  if (error || code == 400 || code == 404 || code == 500)
    return <ErrorComponent code={code} />;
  if (!data) return <LoadingComponent />;
  const onSelectManualReview = (ids) => {
    fetch(`/api/update-manual-review?updatedAt=${moment().toISOString()}`, {
      method: "POST",
      body: JSON.stringify({ ids: ids }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      if (res.status == 404) {
        const data = await res.json();
        setInvalidRepo({
          list: data.ids,
          show: true,
        });
      } else {
        window.location.reload(false);
      }
    });
  };
  const onSelectSuspeciousMark = (ids) => {
    fetch(
      `/api/update-suspicious-repository?updatedAt=${moment().toISOString()}`,
      {
        method: "POST",
        body: JSON.stringify({ ids: ids }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(async (res) => {
      if (res.status == 404) {
        const data = await res.json();
        setInvalidRepo({
          list: data.ids,
          show: true,
        });
      } else {
        window.location.reload(false);
      }
    });
  };

  return (
    <UserRepositoryComponent
      filter={filter}
      setFilter={setFilter}
      limit={limit}
      offset={offset}
      setOffset={setOffset}
      setLimit={setLimit}
      data={data}
      arr={arr}
      setArr={setArr}
      userId={userId}
      onSelectManualReview={onSelectManualReview}
      onSelectSuspeciousMark={onSelectSuspeciousMark}
      invalidRepo={invalidRepo}
      setInvalidRepo={setInvalidRepo}
    />
  );
}
