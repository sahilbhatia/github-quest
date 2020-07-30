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
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  let [filter, setFilter] = useState({});
 
  let { data, error} = useSWR(`/api/[getPublicRepos]?limit=${limit}&offset=${offset}&is_forked=${filter.is_forked}&is_archived=${filter.is_archived}&is_disabled=${filter.is_disabled}&repoName=${filter.repoName}&startDate=${filter.startDate}&endDate=${filter.endDate}&userName=${filter.userName}&is_suspicious=${filter.is_suspicious}&review=${filter.review}&is_private=${filter.is_private}&reviewDate=${filter.reviewDate}`, fetcher);
  if (error) return <ErrorComponent code={error.status}/>
  if (!data) return <LoadingComponent/>
  const minDate=data.date.min;
  data =data.repositories;
  const onSelectManualReview = (id) => {
    fetch(`/api/updateManualReview/[updateManualReview]?id=${id}`);
    window.location.reload(false);
  }

  const onSelectSuspeciousMark = (id) => {
    fetch(`/api/updateSuspiciousRepos/[updateSuspiciousRepos]?id=${id}`);
    window.location.reload(false);
  }

  const columns = [
    {
      name: 'Owner Name',
      selector: d => d.users_repositories[0] ? d.users_repositories[0].user.name : "Unknown",
    },
    {
      name: 'Name',
      selector: d => <a href={d.url}>{d.name}</a>,
    },
    {
      name: 'Description',
      selector: d => (
        <OverlayTrigger
          placement="top"
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
      selector: d => d.review=="pending" ?
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
    selector: d=>d.reviewed_at?<>{moment(d.reviewed_at).utcOffset("+05:30").format().substring(0,10)}</>:<>-</>,
    },
  ];
  const customStyles = {
    table: {
      style: {
        minHeight: "100vh",
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
      when: row => row.review=="pending",
      style: {
        backgroundColor: 'whitesmoke',
        color: 'black',
      },
    },
  ];
  return (
    <div>
      <DataTable
        title="Repositories"
        subHeader
        subHeaderComponent={<Filter filter={filter} setFilter={setFilter} minimumDate={minDate} />}
        columns={columns}
        customStyles={customStyles}
        data={data}
        conditionalRowStyles={conditionalRowStyles}
      />
      {data.length==0 ?
      <></>:
      <Pagination
        limit={limit}
        offset={offset}
        setOffset={setOffset}
        setLimit={setLimit}
        data={data} />
      }
    </div>)
};
