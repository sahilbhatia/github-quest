import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { useState } from "react";
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  let [limit, setLimit] = useState(5);
  let [offset, setOffset] = useState(0);
  let { data, error } = useSWR(`/api/getPublicRepos?limit=${limit}&offset=${offset}`, fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  
  const columns = [
    {
      name: 'Name',
      selector: d=><a href={d.url}>{d.name}</a>,
      sortable: true,
    },
    {
      name: 'description',
      selector: d=>(d.description=="null"?"description not provided":d.description),
      sortable: true,
    },
    {
      name: 'Forked',
      selector: d =>d.is_forked?<>✔</>:<>✘</>, 
      sortable: true,
    },
    {
      name: 'Archived',
      selector: d=>d.is_archived?<>✔</>:<>✘</>,
      sortable: true,
    },
    {
      name: 'Disabled',
      selector: d=>d.is_disabled?<>✔</>:<>✘</>,
      sortable: true,
    },
  ];
  const customStyles = {
    rows: {
      style: {
        color:"black",
        backgroundColor:"blue",
      },
    },
    headCells: {
      style: {
        backgroundColor:"blue",
        fontWeight: "800",
        fontSize: "18px",
        color: "white"
      },
    },
    cells: {
      style: {
        backgroundColor:"whitesmoke",
        fontSize: "16px",
      },
    },
  };
  return (
    <DataTable
      title="Repositories"
      columns={columns}
      customStyles={customStyles}
      data={data}
      pagination
      highlightOnHover
    />)
};

