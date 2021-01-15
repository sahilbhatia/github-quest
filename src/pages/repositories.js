import useSWR from "swr";
import React, { useState, useEffect } from "react";
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
  let [newData, setData] = useState(data);
  useEffect(() => {
    if (!newData) {
      setData(data);
    }
  }, [newData, data]);
  useEffect(() => {
    setData(data);
  }, [offset, limit]);
  if (error || code == 400 || code == 404 || code == 500)
    return <ErrorComponent code={code} />;
  if (!data) return <LoadingComponent />;
  const onSelectManualReview = async (id) => {
    let res = await fetch(
      `/api/update-manual-review?id=${id}&updatedAt=${moment().toISOString()}`,
      { data: null }
    );
    if (res.status == 200) {
      fetch(
        `/api/repositories?limit=${limit}&offset=${offset}${getQueryString(
          filter
        )}`,
        { data: null }
      ).then(async (response) => {
        let code = response.status;
        if (code == 200) {
          let updateData = await response.json();
          setData(updateData);
        }
      });
    }
  };
  const onSelectSuspeciousMark = async (id) => {
    let res = await fetch(
      `/api/update-suspicious-repository?id=${id}&updatedAt=${moment().toISOString()}`
    );
    if (res.status == 200) {
      fetch(
        `/api/repositories?limit=${limit}&offset=${offset}${getQueryString(
          filter
        )}`,
        { data: null }
      ).then(async (response) => {
        let code = response.status;
        if (code == 200) {
          let updateData = await response.json();
          setData(updateData);
        }
      });
    }
  };
  const reFetch = async () => {
    await fetch(`/api/insert-repositories`);
    window.location.reload(false);
  };
  if (newData) {
    return (
      <RepositoryListComponent
        filter={filter}
        setFilter={setFilter}
        limit={limit}
        offset={offset}
        setOffset={setOffset}
        setLimit={setLimit}
        data={newData}
        onSelectManualReview={onSelectManualReview}
        onSelectSuspeciousMark={onSelectSuspeciousMark}
        reFetch={reFetch}
      />
    );
  } else {
    return <></>;
  }
}
