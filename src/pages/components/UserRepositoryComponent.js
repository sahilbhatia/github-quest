import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Filter from "../components/RepoFilterByUser";
import Pagination from "../components/pagination"
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
  userId,
  onSelectManualReview,
  onSelectSuspeciousMark
}) {
  const minDate = data.date.min;
  const userName = data.userName;
  data = data.repositories;
  let utcTimeOffset = new Date().getTimezoneOffset();
  let utc = utcTimeOffset * (-2);
  const columns = [
    {
      name: 'Name',
      selector: d => <a href={d.url}>
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
        </OverlayTrigger></a>,
      "maxWidth": "150px"
    },
    {
      name: 'Description',
      selector: d => (
        <OverlayTrigger
          placement="left"
          delay={{ show: 250, hide: 400 }}
          overlay={
            <Tooltip>
              {d.description == null ? "description not provided" : d.description}
            </Tooltip>
          }
        >
          <span>
            {d.description == null ? "description not provided" : d.description}
          </span>
        </OverlayTrigger>),
      "maxWidth": "260px"
    },
    {
      name: 'Forked',
      selector: d => d.is_forked ? <Link href="/getForkedRepo/[userId]" as={`/getForkedRepo/${d.id}`}><a>{d.parent_of.length}</a></Link> : <>✘</>,
      "maxWidth": "10px"
    },
    {
      name: 'Archived',
      selector: d => d.is_archived ? <>✔</> : <>✘</>,
      "maxWidth": "10px"
    },
    {
      name: 'Disabled',
      selector: d => d.is_disabled ? <>✔</> : <>✘</>,
      "maxWidth": "10px"
    },
    {
      name: 'Private',
      selector: d => d.is_private ? <>✔</> : <>✘</>,
      "maxWidth": "10px"
    },
    {
      name: 'Review Status',
      selector: d => (
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={
            <Tooltip>
              {d.review}
            </Tooltip>
          }
        >
          <span>
            {d.review}
          </span>
        </OverlayTrigger>),
      "maxWidth": "40px"
    },
    {
      name: 'Action',
      selector: d => d.review == "pending" ?
        <div className="d-flex">
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip>
                mark as manual review
              </Tooltip>
            }
          >
            <Button size="sm" onClick={(e) => { onSelectManualReview(d.id) }} className="text-success mx-1 bg-white">✔</Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={
              <Tooltip>
                mark as a suspicious
             </Tooltip>
            }
          >
            <Button size="sm" onClick={(e) => { onSelectSuspeciousMark(d.id) }} className="text-danger mx-2 bg-white">✘</Button>
          </OverlayTrigger>
        </div> : <>-</>,
      "maxWidth": "120px"
    },
    {
      name: 'Error Details',
      selector: d => d.error_details ? (
        <OverlayTrigger
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
        </OverlayTrigger>) : "-",
      "maxWidth": "40px"
    },
    {
      name: 'Review On',
      selector: d => d.reviewed_at ? <>{new Date(moment(d.reviewed_at).utcOffset(utc)).toDateString().substring(4, 15)}</> : <>-</>,
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
        color: "white"
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
      when: row => row.review == "suspicious auto",
      style: {
        backgroundColor: 'white',
        color: 'red',
      },
    },
    {
      when: row => row.review == "suspicious manual",
      style: {
        backgroundColor: 'white',
        color: "orange",
      },
    },
    {
      when: row => row.review == "pending",
      style: {
        backgroundColor: 'whitesmoke',
        color: 'blue',
      },
    },
    {
      when: row => row.review == "no action",
      style: {
        backgroundColor: 'white',
        color: 'grey',
      },
    },
    {
      when: row => row.review == "approved",
      style: {
        backgroundColor: 'white',
        color: 'green',
      },
    },
  ];

  return (
    <div>
      <DataTable
        title={<div className="text-right text-primary"><h1>Repositories of user <a className="text-success">{userName}</a></h1> </div>}
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} minDate={minDate} userId={userId} />}
        columns={columns}
        customStyles={customStyles}
        data={data}
        conditionalRowStyles={conditionalRowStyles}
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
      <Button href="/users" className="m-3 bg-dark">Back</Button>
    </div>)
};

UserRepositoryComponent.prototype = {
  userId: PropTypes.number.isRequired,
  data: PropTypes.array.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  onSelectManualReview: PropTypes.func.isRequired,
  onSelectSuspeciousMark: PropTypes.func.isRequired
};