import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import React, { useState } from "react";
import Filter from "./projectFilter";
import Pagination from "./pagination"
import Link from "next/link";
export default function ProjectListComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data }) {
  const minDate = data.date.min;
  data = data.projects;
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
      selector: d => d.users_projects.length != 0 ? <Link href="/getUsers/[projectId]" as={`/getUsers/${d.id}`}><a>{d.users_projects.length}</a></Link> : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.projects_repositories.length != 0 ? <Link href="/getProjectRepositories/[projectId]" as={`/getProjectRepositories/${d.id}`}><a>{d.projects_repositories.length}</a></Link> : <>✘</>
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
    <div data-testid="projectList">
      <DataTable
        title={<div className="text-right text-primary"><h1>Projects</h1></div>}
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} minDate={minDate} />}
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
