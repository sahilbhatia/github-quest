import useSWR from "swr";
import React, { useState } from "react";
import ErrorComponent from "./components/errorpage";
import LoadingComponent from "./components/loaderpage";
import moment from "moment";
import RepositoryListComponent from "./components/RepositoryListComponent";
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
  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map((key) => {
      filterString += "&" + key + "=" + filterObject[key];
    });
    return filterString;
  };
  let { data, error } = useSWR(
    `/api/repositories?limit=${limit}&offset=${offset}${getQueryString(
      filter
    )}`,
    fetcher
  );
  if (error || code == 400 || code == 404 || code == 500)
    return <ErrorComponent code={code} />;
  if (!data) return <LoadingComponent />;
  const onSelectManualReview = (ids) => {
    if (ids != "") {
      fetch(`/api/update-manual-review?updatedAt=${moment().toISOString()}`, {
        method: "POST",
        body: JSON.stringify({ ids: ids }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.reload(false);
    }
  };
  const onSelectSuspeciousMark = (ids) => {
    if (ids != "") {
      fetch(
        `/api/update-suspicious-repository?updatedAt=${moment().toISOString()}`,
        {
          method: "POST",
          body: JSON.stringify({ ids: ids }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload(false);
    }
  };
  const reFetch = async () => {
    await fetch(`/api/insert-repositories`);
    window.location.reload(false);
  };
  return (
    <RepositoryListComponent
      filter={filter}
      setFilter={setFilter}
      limit={limit}
      offset={offset}
      setOffset={setOffset}
      setLimit={setLimit}
      data={data}
      arr={arr}
      setArr={setArr}
      onSelectManualReview={onSelectManualReview}
      onSelectSuspeciousMark={onSelectSuspeciousMark}
      reFetch={reFetch}
    />
  );
}
