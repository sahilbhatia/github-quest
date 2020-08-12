import useSWR from 'swr';
import { useRouter } from 'next/router';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { useState } from "react";
import Filter from "../components/userFilter";
import Pagination from "../components/pagination"
import Link from "next/link";
import ErrorComponent from "../components/errorpage";
import LoadingComponent from "../components/loaderpage";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  const router = useRouter()
  const { projectId } = router.query;
  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map(key => { filterString += "&" + key + "=" + filterObject[key] });
    return filterString;
  }
  let [filter, setFilter] = useState({});
  let { error, data } = useSWR(`/api/getUserList?limit=${limit}&offset=${offset}${getQueryString(filter)}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  const columns = [
    {
      name: 'Name',
      selector: "name"
    },
    {
      name: "Github Handle",
      selector: d=>d.github_handle?<>{d.github_handle}</>:"not linked"
    },
    {
      name: "Email",
      selector: "email"
    },
    {
      name: "Projects",
      selector: d => d.users_projects.length != 0 ? <Link href="/getProjects/[userId]" as={`/getProjects/${d.id}`}><a>{d.users_projects.length}</a></Link>  : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.users_repositories.length != 0 ? <Link href="/getPublicRepositories/[userId]" as={`/getPublicRepositories/${d.id}`}><a>{d.users_repositories.length}</a></Link>  : <>✘</>,
    },
  ];
  const customStyles = {
    table: {
      style: {
        minHeight: "40vh",
      },
    },
    rows: {
      style: {
        color: "blue",
        backgroundColor: "white",
      },
    },
    headCells: {
      style: {
        backgroundColor: "blue",
        fontWeight: "800",
        fontSize: "18px",
        color: "white"
      },
    },
    cells: {
      style: {
        fontSize: "16px",
      },
    },
  };
  return (
    <div>
      <DataTable
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} />}
        title={<div className="text-right"><h1>Users</h1></div>}
        columns={columns}
        customStyles={customStyles}
        data={data}
      />
      {data.length == 0 ?
        <></> :
        <Pagination
          limit={limit}
          offset={offset}
          setOffset={setOffset}
          setLimit={setLimit}
          data={data}
        />
      }
    </div>)
};
