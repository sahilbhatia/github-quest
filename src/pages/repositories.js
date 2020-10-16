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
  let [limit, setLimit] = useState(0);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
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
  const onSelectManualReview = (id) => {
    fetch(
      `/api/update-manual-review?id=${id}&updatedAt=${moment().toISOString()}`,
      { data: null }
    );
    window.location.reload(false);
  };
  const onSelectSuspeciousMark = (id) => {
    fetch(
      `/api/update-suspicious-repository?id=${id}&updatedAt=${moment().toISOString()}`
    );
    window.location.reload(false);
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
      onSelectManualReview={onSelectManualReview}
      onSelectSuspeciousMark={onSelectSuspeciousMark}
      reFetch={reFetch}
    />
  );
}
