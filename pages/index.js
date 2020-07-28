import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { useState } from "react";
import Filter from "../components/filter";
import Pagination from "../components/pagination"
import Link from "next/link";
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  let [limit, setLimit] = useState(5);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
  let { data, error } = useSWR(`/api/[getPublicRepos]?limit=${limit}&offset=${offset}&is_forked=${filter.is_forked}&is_archived=${filter.is_archived}&is_disabled=${filter.is_disabled}&like=${filter.name}&startDate=${filter.startDate}&endDate=${filter.endDate}`, fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  console.log(data[0])
  const columns = [
    {
      name: 'Owner Name',
      selector: d => d.users_repositories[0].user.name,
    },
    {
      name: 'Name',
      selector: d => <a href={d.url}>{d.name}</a>,
    },
    {
      name: 'description',
      selector: d => d.description == null ? "description not provided" : d.description,
    },
    {
      name: 'Forked',
    selector: d => d.is_forked ?<Link href="/get-forked-repo/[userId]" as={`/get-forked-repo/${d.id}`}><a>{d.parent_of.length}</a></Link>: <>✘</>,
    },
    {
      name: 'Archived',
      selector: d => d.is_archived ? <>✔</> : <>✘</>,
    },
    {
      name: 'Disabled',
      selector: d => d.is_disabled ? <>✔</> : <>✘</>,
    },
    {
      name: 'Private',
      selector: d => d.is_private ? <>✔</> : <>✘</>,
    },
    {
      name: 'Action',
      selector: d => !d.is_forked && !d.is_suspicious ? <div className="d-flex"><h3 style={{color:"green"}}>✔</h3> <h3 style={{color:"red"}}>✘</h3></div>:<>✘</>,
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
  const conditionalRowStyles = [
    {
      when: row => row.is_suspicious,
      style: {
        backgroundColor: 'red',
        color: 'red',
      },
    },
  ];
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
        conditionalRowStyles={conditionalRowStyles}
      />
      <Pagination
        limit={limit}
        offset={offset}
        setOffset={setOffset}
        setLimit={setLimit}
        data={data} />
    </div>)
};
