import { useRouter } from 'next/router'
import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { useState } from "react";
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Post() {
  const router = useRouter()
  const { userId } = router.query
  let { data, error } = useSWR(`/api/getForkedRepo?id=${userId}`, fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  const columns = [
    {
      name: 'Owner Name',
      selector: d => d.users_repositories[0] ? d.users_repositories[0].user.name : "Unknown",
    },
    {
      name: 'Name',
      selector: d => <a href={d.url}>{d.name}</a>,
    },

    {
      name: 'forked child count',
      selector: d => d.parent_of.length,
    },
    {
      name: 'forked count of same parent',
      selector: d => d.child_of.parent_of.length,
    },
    {
      name: 'Suspicious',
      selector: d => d.is_suspicious ? <>✔</> : <>✘</>,
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
      <DataTable
        title="forked repos"
        columns={columns}
        customStyles={customStyles}
        data={data}
        highlightOnHover
      />
    </div>)
};
