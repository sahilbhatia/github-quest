import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { useState } from "react";
import Filter from "../components/filter";
import Pagination from "../components/pagination"
import Link from "next/link";
import ErrorComponent from "../components/errorpage";
import LoadingComponent from "../components/loaderpage";
import moment from "moment";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});

  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map(key => { filterString += "&" + key + "=" + filterObject[key] });
    return filterString;
  }
  let { data, error } = useSWR(`/api/[getPublicRepos]?limit=${limit}&offset=${offset}${getQueryString(filter)}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  const minDate = data.date.min;
  data = data.repositories;
  let utc = new Date().getTimezoneOffset;
  const onSelectManualReview = (id) => {
    fetch(`/api/updateManualReview/[updateManualReview]?id=${id}&updatedAt=${moment().toISOString()}`);
    window.location.reload(false);
  }
  const onSelectSuspeciousMark = (id) => {
    fetch(`/api/updateSuspiciousRepos/[updateSuspiciousRepos?id=${id}&updatedAt=${moment().toISOString()}`);
    window.location.reload(false);
  }
  const columns = [
    {
      name: 'Owner Name',
      selector: d => d.users_repositories[0] ? d.users_repositories[0].user.name : "Unknown",
    },
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
    },
    {
      name: 'Forked',
      selector: d => d.is_forked ? <Link href="/getForkedRepo/[userId]" as={`/getForkedRepo/${d.id}`}><a>{d.parent_of.length}</a></Link> : <>✘</>,
    },
    {
      name: 'Archived',
      selector: d => d.is_archived ? <>✔</> : <>✘</>,
    },
    {
      name: 'Disabled',
      selector: d => d.is_disabled ? <>✔</> : <>✘</>,
    },
    {
      name: 'Private',
      selector: d => d.is_private ? <>✔</> : <>✘</>,
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
    },
    {
      name: 'Review On',
      selector: d => d.reviewed_at ? <>{moment(d.reviewed_at).utcOffset(utc).format().substring(0, 10)}</> : <>-</>,
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
        color: 'black',
      },
    },
    {
      when: row => row.review == "no action",
      style: {
        backgroundColor: 'white',
        color: 'purple',
      },
    },
  ];
  return (
    <div>
      <DataTable
        title="Repositories"
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} minDate={minDate} />}
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
          data={data} />
      }
    </div>)
};
