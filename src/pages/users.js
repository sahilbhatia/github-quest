import useSWR from 'swr';
import React, { useState } from "react";
import ErrorComponent from "./components/errorpage";
import LoadingComponent from "./components/loaderpage";
import UserListComponent from "./components/UserListComponent"
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map(key => { filterString += "&" + key + "=" + filterObject[key] });
    return filterString;
  }
  let [filter, setFilter] = useState({});
  let { error, data } = useSWR(`/api/getUserList?limit=${limit}&offset=${offset}${getQueryString(filter)}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />

  return (<UserListComponent
    filter={filter}
    setFilter={setFilter}
    limit={limit}
    offset={offset}
    setOffset={setOffset}
    setLimit={setLimit}
    data={data}
  />)
};
