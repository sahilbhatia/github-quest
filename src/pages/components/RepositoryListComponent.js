import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import React from "react";
import Filter from "./filter";
import Pagination from "./pagination";
import Link from "next/link";
import PropTypes from "prop-types";
import moment from "moment";

export default function RepositoryListComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data,
  onSelectManualReview,
  onSelectSuspeciousMark,
}) {
  const minDate = data ? data.date.min : undefined;
  data = data ? data.repositories : undefined;
  let utcTimeOffset = new Date().getTimezoneOffset();
  let utc = utcTimeOffset * -2;
  const columns = [
    {
      name: "Owner Name",
      selector: function func(d) {
        return d.users_repositories[0] ? (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>{d.users_repositories[0].user.name}</Tooltip>}
          >
            <span>{d.users_repositories[0].user.name}</span>
          </OverlayTrigger>
        ) : (
          "Unknown"
        );
      },
      maxWidth: "150px",
    },
    {
      name: "Name",
      selector: function func(d) {
        return (
          <a href={d.url}>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>{d.name}</Tooltip>}
            >
              <span>{d.name}</span>
            </OverlayTrigger>
          </a>
        );
      },
      maxWidth: "150px",
    },
    {
      name: "Description",
      selector: function func(d) {
        return (
          <OverlayTrigger
            placement="left"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip>
                {d.description == null || d.description == ""
                  ? "description not provided"
                  : d.description}
              </Tooltip>
            }
          >
            <span>
              {d.description == null || d.description == ""
                ? "description not provided"
                : d.description}
            </span>
          </OverlayTrigger>
        );
      },
      maxWidth: "260px",
    },
    {
      name: "Forked",
      selector: function func(d) {
        return d.parent_of.length > 0 ? (
          <Link href="/forks/[userId]" as={`/forks/${d.id}`}>
            <Button className="bg-white border-white text-primary btn-sm">
              {d.parent_of.length}
            </Button>
          </Link>
        ) : d.is_forked ? (
          <>✔</>
        ) : (
          <>✘</>
        );
      },
      maxWidth: "10px",
    },
    {
      name: "Archived",
      selector: function func(d) {
        return d.is_archived ? <>✔</> : <>✘</>;
      },
      maxWidth: "10px",
    },
    {
      name: "Disabled",
      selector: function func(d) {
        return d.is_disabled ? <>✔</> : <>✘</>;
      },
      maxWidth: "10px",
    },
    {
      name: "Review Status",
      selector: function func(d) {
        return (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>{d.review}</Tooltip>}
          >
            <span>{d.review}</span>
          </OverlayTrigger>
        );
      },
      maxWidth: "40px",
    },
    {
      name: "Source Type",
      selector: function func(d) {
        return (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>{d.source_type}</Tooltip>}
          >
            <span>{d.source_type}</span>
          </OverlayTrigger>
        );
      },
      maxWidth: "40px",
    },
    {
      name: "Action",
      selector: function func(d) {
        return d.review == "pending" ? (
          <div className="d-flex">
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>mark as manual review</Tooltip>}
            >
              <Button
                size="sm"
                onClick={() => {
                  onSelectManualReview(d.id);
                }}
                className="text-success mx-1 bg-white"
              >
                ✔
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>mark as a suspicious</Tooltip>}
            >
              <Button
                size="sm"
                onClick={() => {
                  onSelectSuspeciousMark(d.id);
                }}
                className="text-danger mx-2 bg-white"
              >
                ✘
              </Button>
            </OverlayTrigger>
          </div>
        ) : (
          <>-</>
        );
      },
      maxWidth: "120px",
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
      maxWidth: "40px",
    },
    {
      name: "Review On",
      selector: function func(d) {
        return d.reviewed_at ? (
          <>
            {new Date(moment(d.reviewed_at).utcOffset(utc))
              .toDateString()
              .substring(4, 15)}
          </>
        ) : (
          <>-</>
        );
      },
      maxWidth: "150px",
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
        color: "white",
      },
    },
    cells: {
      style: {
        backgroundColor: "",
        fontSize: "16px",
      },
    },
  };
  const conditionalRowStyles = [
    {
      when: (row) => row.review == "suspicious auto",
      style: {
        backgroundColor: "white",
        color: "red",
      },
    },
    {
      when: (row) => row.review == "suspicious manual",
      style: {
        backgroundColor: "white",
        color: "orange",
      },
    },
    {
      when: (row) => row.review == "pending",
      style: {
        backgroundColor: "whitesmoke",
        color: "blue",
      },
    },
    {
      when: (row) => row.review == "no action",
      style: {
        backgroundColor: "white",
        color: "grey",
      },
    },
    {
      when: (row) => row.review == "approved",
      style: {
        backgroundColor: "white",
        color: "green",
      },
    },
  ];
  return (
    <div>
      <DataTable
        title={
          <div className="d-flex justify-content-end text-primary">
            <h1>Repositories</h1>
          </div>
        }
        subHeader
        subHeaderComponent={
          <Filter filter={filter} setFilter={setFilter} minDate={minDate} />
        }
        columns={columns}
        customStyles={customStyles}
        data={data}
        conditionalRowStyles={conditionalRowStyles}
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

RepositoryListComponent.propTypes = {
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  onSelectManualReview: PropTypes.func.isRequired,
  onSelectSuspeciousMark: PropTypes.func.isRequired,
};
