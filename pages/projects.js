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
  let { data, error } = useSWR(`/api/[getProjects]?limit=${limit}&offset=${offset}${getQueryString(filter)}`, fetcher);
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
      selector: d => d.users_projects.length
    },
    {
      name: "Repositories",
      selector: d => d.repositories.length
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
        color: "green",
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
  const conditionalRowStyles = [
    {
      when: row => !row.is_active,
      style: {
        backgroundColor: 'white',
        color: 'red',
      },
    },
  ];
  return (
    <div>
      <DataTable
        title="Projects"
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} />}
        columns={columns}
        customStyles={customStyles}
        data={data}
        conditionalRowStyles={conditionalRowStyles}
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
