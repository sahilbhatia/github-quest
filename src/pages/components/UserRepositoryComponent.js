import DataTable from "react-data-table-component";
import {
  Tooltip,
  OverlayTrigger,
  Button,
  FormCheck,
  DropdownButton,
  Dropdown,
  Form,
} from "react-bootstrap";
import React, { useState } from "react";
import Filter from "../components/RepoFilterByUser";
import Pagination from "../components/pagination";
import Link from "next/link";
import moment from "moment";
import PropTypes from "prop-types";

export default function UserRepositoryComponent({
  filter,
  setFilter,
  limit,
  offset,
  setOffset,
  setLimit,
  data,
  arr,
  setArr,
  comment,
  setComment,
  userId,
  onSelectManualReview,
  onSelectSuspeciousMark,
}) {
  let [checkAll, setCheckAll] = useState(false);
  let [actionHidden, setActionHidden] = useState(true);
  let [commentDisabled, setCommentDisabled] = useState(true);
  const minDate = data ? data.date.min : undefined;
  const userName = data ? data.userName : undefined;
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
    setActionHidden(arr.length == 0);
    setCommentDisabled(arr.length != 1);
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
    setActionHidden(arr.length == 0);
    setCommentDisabled(true);
  };

  const columns = [
    {
      selector: function func(d) {
        return d.review == "pending" ? (
          <div>
            <FormCheck
              className="mx-4"
              defaultChecked={checkAll || arr.includes(d.id)}
              onClick={() => {
                markId(d.id);
              }}
            />
          </div>
        ) : (
          <span className="mx-4">-</span>
        );
      },
      maxWidth: "40px",
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
      name: "Comment",
      selector: function func(d) {
        return d.comment ? (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>{d.comment}</Tooltip>}
          >
            <span>{d.comment}</span>
          </OverlayTrigger>
        ) : (
          "-"
        );
      },
      maxWidth: "40px",
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
          <div className="text-right text-primary">
            <h1>
              Repositories of user{" "}
              <span className="text-success">{userName}</span>
            </h1>{" "}
          </div>
        }
        subHeader
        subHeaderComponent={
          <div className="w-100">
            <Filter
              filter={filter}
              setFilter={setFilter}
              minDate={minDate}
              userId={userId}
            />
            <div className="d-flex">
              <OverlayTrigger
                placement="bottom"
                delay={{ show: 250, hide: 400 }}
                overlay={<Tooltip>Selecte All</Tooltip>}
              >
                <FormCheck
                  className="mt-2 "
                  defaultChecked={checkAll}
                  onClick={() => {
                    markAll(checkAll);
                  }}
                />
              </OverlayTrigger>
              {actionHidden ? (
                <div>
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={<Tooltip>Repositories Not Selected</Tooltip>}
                  >
                    <span>
                      <DropdownButton
                        className="ml-2 mt-1"
                        title="Action"
                        size="sm"
                        disabled={actionHidden}
                        style={{ pointerEvents: "none" }}
                      >
                        <Dropdown.Item
                          onClick={() => onSelectManualReview(arr)}
                          className="bg-success"
                        >
                          Approved
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => onSelectSuspeciousMark(arr)}
                          className="bg-warning"
                        >
                          mark suspicious
                        </Dropdown.Item>
                      </DropdownButton>
                    </span>
                  </OverlayTrigger>
                </div>
              ) : (
                <DropdownButton
                  className="ml-2 mt-1"
                  title="Action"
                  size="sm"
                  disabled={actionHidden}
                >
                  <Dropdown.Item
                    onClick={() => onSelectManualReview(arr, comment)}
                    className="bg-success"
                  >
                    Approved
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => onSelectSuspeciousMark(arr, comment)}
                    className="bg-warning"
                  >
                    mark suspicious
                  </Dropdown.Item>
                </DropdownButton>
              )}
              {commentDisabled ? (
                <OverlayTrigger
                  placement="bottom"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip>
                      Enable to add comment for multiple repositories
                    </Tooltip>
                  }
                >
                  <span>
                    <Form.Control
                      type="text"
                      size="sm"
                      className="m-1"
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add Comment..."
                      disabled={commentDisabled}
                      style={{ pointerEvents: "none", width: "220px" }}
                    />
                  </span>
                </OverlayTrigger>
              ) : (
                <Form.Control
                  style={{ width: "220px" }}
                  type="text"
                  size="sm"
                  className="m-1"
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add Comment..."
                  disabled={commentDisabled}
                />
              )}
            </div>
          </div>
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
      <Button href="/users" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

UserRepositoryComponent.propTypes = {
  userId: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  arr: PropTypes.array.isRequired,
  setArr: PropTypes.func.isRequired,
  comment: PropTypes.string.isRequired,
  setComment: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  onSelectManualReview: PropTypes.func.isRequired,
  onSelectSuspeciousMark: PropTypes.func.isRequired,
};
