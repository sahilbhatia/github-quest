import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { useState } from "react";
import Filter from "../components/filter";
import Pagination from "../components/pagination"
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  let [limit, setLimit] = useState(5);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
  let { data, error } = useSWR(`/api/getPublicRepos?limit=${limit}&offset=${offset}&is_forked=${filter.is_forked}&is_archived=${filter.is_archived}&is_disabled=${filter.is_disabled}&like=${filter.name}&startDate=${filter.startDate}&endDate=${filter.endDate}`, fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const columns = [
    {
      name: 'Name',
      selector: d => <a href={d.url}>{d.name}</a>,
    },
    {
      name: 'description',
      selector: d => (d.description == "null" ? "description not provided" : d.description),
    },
    {
      name: 'Forked',
      selector: d => d.is_forked ? <>✔</> : <>✘</>,
    },
    {
      name: 'Archived',
      selector: d => d.is_archived ? <>✔</> : <>✘</>,
    },
    {
      name: 'Disabled',
      selector: d => d.is_disabled ? <>✔</> : <>✘</>,
    },
  ];
  const customStyles = {
    rows: {
      style: {
        color: "black",
        backgroundColor: "blue",
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
        backgroundColor: "whitesmoke",
        fontSize: "16px",
      },
    },
  };
  return (
    <div>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"></link>
      <DataTable
        title="Repositories"
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} />}
        columns={columns}
        customStyles={customStyles}
        data={data}
        highlightOnHover
      />
      <Pagination
        limit={limit}
        offset={offset}
        setOffset={setOffset}
        setLimit={setLimit}
        data={data} />
    </div>)
};

