import useSWR from 'swr';
import { useRouter } from 'next/router';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { useState } from "react";
import Filter from "../../components/userFilter";
import Pagination from "../../components/pagination"
import Link from "next/link";
import ErrorComponent from "../../components/errorpage";
import LoadingComponent from "../../components/loaderpage";
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
  let { error, data } = useSWR(`/api/getUsers?limit=${limit}&offset=${offset}&projectId=${projectId}${getQueryString(filter)}`, fetcher);
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
      name: "Github Handel",
      selector : "github_handle"
    },
    {
      name: "Email",
      selector : "email"
    },
    {
      name: "Projects",
      selector: d => d.users_projects.length !=0 ? d.users_projects[0].user.users_projects.length : <>✘</>,
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
        title="Users"
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
