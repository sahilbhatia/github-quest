import DataTable from "react-data-table-component";
import {
  Tooltip,
  OverlayTrigger,
  Button,
  FormCheck,
  DropdownButton,
  Dropdown,
  Modal,
} from "react-bootstrap";
import React, { useState } from "react";
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
  arr,
  setArr,
  data,
  onSelectManualReview,
  onSelectSuspeciousMark,
  reFetch,
}) {
  const minDate = data ? data.date.min : undefined;
  let [checkAll, setCheckAll] = useState(false);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const lastFetchedAt = data
    ? moment(data.last_fetched_at).utcOffset(660).toLocaleString()
    : undefined;
  data = data ? data.repositories : undefined;
  let utcTimeOffset = new Date().getTimezoneOffset();
  let utc = utcTimeOffset * -2;

  const getRemark = (commits) => {
    let message = "review status changed because of ";
    commits.map((commit, index) => {
      message += `(${index + 1}) ${commit.commit}`;
    });
    return message;
  };

  const markId = (id) => {
    arr.includes(id) ? arr.splice(arr.indexOf(id), 1) : arr.push(id);
    setArr(arr);
  };

  const markAll = async (check) => {
    if (check) {
      setCheckAll(false);
      arr = [];
      setArr(arr);
    } else {
      setCheckAll(true);
      arr = [];
      setArr(arr);
      await data.map((item) => {
        if (item.review == "pending") {
          arr.push(item.id);
        }
      });
      setArr(arr);
    }
  };

  const columns = [
    {
      name: (
        <div className="">
          <div className="d-flex">
            <FormCheck
              className="pt-2"
              defaultChecked={checkAll}
              onClick={() => {
                markAll(checkAll);
              }}
            />
            <span className="pt-2">select all</span>
          </div>
          <DropdownButton className="ml-2" title="Action">
            <Dropdown.Item
              onClick={() =>
                arr.length == 0 ? handleShow() : onSelectManualReview(arr)
              }
              className="bg-success"
            >
              Approved
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() =>
                arr.length == 0 ? handleShow() : onSelectSuspeciousMark(arr)
              }
              className="bg-warning"
            >
              mark suspicious
            </Dropdown.Item>
          </DropdownButton>
        </div>
      ),
      selector: function func(d) {
        return d.review == "pending" ? (
          <div>
            <FormCheck
              className="px-5"
              defaultChecked={checkAll || arr.includes(d.id)}
              onClick={() => {
                markId(d.id);
              }}
            />
          </div>
        ) : (
          <>-</>
        );
      },
      maxWidth: "120px",
    },
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
      name: "Remark",
      selector: function func(d) {
        return (
          <OverlayTrigger
            placement="left"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip>
                {d.commits.length != 0 ? getRemark(d.commits) : "-"}
              </Tooltip>
            }
          >
            <span>{d.commits.length != 0 ? getRemark(d.commits) : "-"}</span>
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
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body>Repository Not Selected</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="text-right ">
        <span className="text-dark">last fetched at </span>
        <span className="border border-dark pl-1 text-danger">
          {lastFetchedAt.substring(0, 24)}
        </span>
      </div>
      <div className="text-right ">
        <span className="text-dark">Refetch </span>
        <Button className="ml-2 btn-sm" variant="danger" onClick={reFetch}>
          ↺
        </Button>
      </div>
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
  arr: PropTypes.array.isRequired,
  setArr: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  onSelectManualReview: PropTypes.func.isRequired,
  onSelectSuspeciousMark: PropTypes.func.isRequired,
  reFetch: PropTypes.func.isRequired,
};
