import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import React from "react";
import Filter from "./projectFilter";
import Pagination from "./pagination";
import PropTypes from "prop-types";
import Link from "next/link";
export default function ProjectListComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data,
}) {
  const minDate = data ? data.date.min : undefined;
  data = data ? data.projects : undefined;
  const columns = [
    {
      name: "Name",
      selector: function func(d) {
        return (
          <div>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>{d.name}</Tooltip>}
            >
              <span>{d.name}</span>
            </OverlayTrigger>
          </div>
        );
      },
    },
    {
      name: "Active Users",
      selector: function func(d) {
        return d.users_projects.length != 0 ? (
          <Link href="/getUsers/[projectId]" as={`/getUsers/${d.id}`}>
            <Button className="bg-white border-white text-primary btn-sm">
              {d.users_projects.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
    {
      name: "Repositories",
      selector: function func(d) {
        return d.projects_repositories.length != 0 ? (
          <Link
            href="/getProjectRepositories/[projectId]"
            as={`/getProjectRepositories/${d.id}`}
          >
            <Button className="bg-white border-white text-primary btn-sm">
              {" "}
              {d.projects_repositories.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
    {
      name: "Active",
      selector: function func(d) {
        return d.is_active ? (
          <span className="text-success">✔</span>
        ) : (
          <span className="text-danger">✘</span>
        );
      },
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
        color: "white",
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
        title={
          <div className="text-right text-primary">
            <h1>Projects</h1>
          </div>
        }
        subHeader
        subHeaderComponent={
          <Filter filter={filter} setFilter={setFilter} minDate={minDate} />
        }
        columns={columns}
        customStyles={customStyles}
        data={data}
      />
      {data ? (
        data.length == 0 ? (
          <></>
        ) : (
          <Pagination
            limit={limit}
            offset={offset}
            setOffset={setOffset}
            setLimit={setLimit}
            data={data}
          />
        )
      ) : (
        <></>
      )}
      <Button href="/" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

ProjectListComponent.propTypes = {
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
};
