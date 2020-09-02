import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import React from "react";
import Filter from "./userFilter";
import Pagination from "./pagination";
import Link from "next/link";
import PropTypes from "prop-types";

export default function UserListComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data,
}) {
  const minDate = data.date.min;
  data = data.users;
  const columns = [
    {
      name: "Name",
      selector: "name",
    },
    {
      name: "Github Handle",
      selector: function func(d) {
        d.github_handle ? <>{d.github_handle}</> : "not provided";
      },
    },
    {
      name: "Email",
      selector: "email",
    },
    {
      name: "Projects",
      selector: function func(d) {
        return d.users_projects.length != 0 ? (
          <Link href="/getProjects/[userId]" as={`/getProjects/${d.id}`}>
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
        return d.users_repositories.length != 0 ? (
          <Link
            href="/getPublicRepositories/[userId]"
            as={`/getPublicRepositories/${d.id}`}
          >
            <Button className="bg-white border-white text-primary btn-sm">
              {d.users_repositories.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
    {
      name: "Error Details",
      selector: function func(d) {
        return d.error_details ? (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>{d.error_details}</Tooltip>}
          >
            <span>{d.error_details}</span>
          </OverlayTrigger>
        ) : (
          "-"
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
        color: "blue",
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
        subHeader
        subHeaderComponent={
          <Filter filter={filter} setFilter={setFilter} minDate={minDate} />
        }
        title={
          <div className="text-right text-primary">
            <h1>Users</h1>
          </div>
        }
        columns={columns}
        customStyles={customStyles}
        data={data}
      />
      {data.length == 0 ? (
        <></>
      ) : (
        <Pagination
          limit={limit}
          offset={offset}
          setOffset={setOffset}
          setLimit={setLimit}
          data={data}
        />
      )}
      <Button href="/" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

UserListComponent.propTypes = {
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
};
