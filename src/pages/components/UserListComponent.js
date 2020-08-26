import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import React, { useState } from "react";
import Filter from "./userFilter";
import Pagination from "./pagination"
import Link from "next/link";

export default function UserListComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data
}) {
  console.log(data)
  const minDate = data.date.min;
  data = data.users;
  const columns = [
    {
      name: 'Name',
      selector: "name"
    },
    {
      name: "Github Handle",
      selector: d => d.github_handle ? <>{d.github_handle}</> : "not provided"
    },
    {
      name: "Email",
      selector: "email"
    },
    {
      name: "Projects",
      selector: d => d.users_projects.length != 0 ? <Link href="/getProjects/[userId]" as={`/getProjects/${d.id}`}><a>{d.users_projects.length}</a></Link> : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.users_repositories.length != 0 ? <Link href="/getPublicRepositories/[userId]" as={`/getPublicRepositories/${d.id}`}><a>{d.users_repositories.length}</a></Link> : <>✘</>,
    },
    {
      name: 'Error Details',
      selector: d =>d.error_details? <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip>
          {d.error_details}
        </Tooltip>
      }
    >
      <span>
        {d.error_details}
      </span>
    </OverlayTrigger>:"-",
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
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} minDate={minDate} />}
        title={<div className="text-right text-primary"><h1>Users</h1></div>}
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
      <Button href="/" className="m-3 bg-dark">Back</Button>
    </div>)
};
