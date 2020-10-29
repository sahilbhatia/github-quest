import React from "react";
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

export default function ForkedRepoComponent({ data }) {
  const columns = [
    {
      name: "Owner Name",
      selector: (d) =>
        d.users_repositories[0] ? d.users_repositories[0].user.name : "Unknown",
    },
    {
      name: "Name",
      selector: function func(d) {
        return <a href={d.url}>{d.name}</a>;
      },
    },
    {
      name: "forked child count",
      selector: (d) => d.children.length,
    },
    {
      name: "forked count of same parent",
      selector: (d) => d.parent.children.length,
    },
    {
      name: "Suspicious",
      selector: function func(d) {
        return d.is_suspicious ? <>✔</> : <>✘</>;
      },
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
        color: "white",
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
        title={
          <div className="d-flex justify-content-end text-primary">
            <h2>forked repositories</h2>
          </div>
        }
        columns={columns}
        customStyles={customStyles}
        data={data}
        highlightOnHover
      />
      <Button href="/repositories" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

ForkedRepoComponent.propTypes = {
  data: PropTypes.array.isRequired,
};
