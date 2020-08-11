import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { useState } from "react";
import Filter from "../components/projectFilter";
import Pagination from "../components/pagination"
import Link from "next/link";
import ErrorComponent from "../components/errorpage";
import LoadingComponent from "../components/loaderpage";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});

    const getQueryString = (filterObject) => {
      let filterString = "";
      Object.keys(filterObject).map(key => { filterString += "&" + key + "=" + filterObject[key] });
      return filterString;
    }
  let { data, error } = useSWR(`/api/getProjects?limit=${limit}&offset=${offset}${getQueryString(filter)}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  const columns = [
    {
      name: 'Name',
      selector: d => <div>
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={
            <Tooltip>
              {d.name}
            </Tooltip>
          }
        >
          <span>
            {d.name}
          </span>
        </OverlayTrigger></div>
    },
    {
      name: "Active Users",
      selector: d => d.users_projects.length !=0 ?<Link href="/getUsers/[projectId]" as={`/getUsers/${d.id}`}><a>{d.users_projects.length}</a></Link> : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.projects_repositories.length !=0 ?<Link href="/getRepositories/[projectId]" as={`/getRepositories/${d.id}`}><a>{d.projects_repositories.length}</a></Link> : <>✘</>
    },
    {
      name: "Active",
      selector: d => d.is_active ? <span className="text-success">✔</span> : <span className="text-danger">✘</span>
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
        color: "black",
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
        title="Projects"
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} />}
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
