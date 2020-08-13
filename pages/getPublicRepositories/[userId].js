import useSWR from 'swr';
import { useRouter } from 'next/router';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { useState } from "react";
import Filter from "../../components/RepoFilterByUser";
import Pagination from "../../components/pagination"
import Link from "next/link";
import ErrorComponent from "../../components/errorpage";
import LoadingComponent from "../../components/loaderpage";
import moment from "moment";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
  const router = useRouter()
  const { userId } = router.query;
  const getQueryString = (filterObject) => {
    let filterString = "";
    Object.keys(filterObject).map(key => { filterString += "&" + key + "=" + filterObject[key] });
    return filterString;
  }
  let { data, error } = useSWR(`/api/getPublicRepos?limit=${limit}&offset=${offset}&userId=${userId}${getQueryString(filter)}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  const minDate = data.date.min;
  data = data.repositories; 
  let utcTimeOffset = new Date().getTimezoneOffset();
  let utc = utcTimeOffset * (-2);
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
      name: 'Review On',
      selector: d => d.reviewed_at ? <>{new Date(moment(d.reviewed_at).utcOffset(utc)).toDateString().substring(4,15)}</> : <>-</>,
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
        title={<div className="text-right">Repositories </div>}
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
          data={data}
        />
      }
    </div>)
};
