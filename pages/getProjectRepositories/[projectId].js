import useSWR from 'swr';
import { useRouter } from 'next/router';
import DataTable from "react-data-table-component";
import { useState } from "react";
import { Button } from "react-bootstrap";
import Pagination from "../../components/pagination";
import ErrorComponent from "../../components/errorpage";
import LoadingComponent from "../../components/loaderpage";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
  let [limit, setLimit] = useState(10);
  let [offset, setOffset] = useState(0);
  const router = useRouter()
  const { projectId } = router.query;
  let { error, data } = useSWR(`/api/getProjectRepositories?limit=${limit}&offset=${offset}&projectId=${projectId}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  const columns = [
    {
      name: 'Host',
      selector: d => d.host != null ? d.host : "host not provided"
    },
    {
      name: 'url',
      selector: d => d.repository_url != null ? d.repository_url : "url not provided"
    },
  ];
  const customStyles = {
    rows: {
      style: {
        color: "purple",
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
        fontSize: "16px",
      },
    },
  };
  return (
    <div>
      <DataTable
        title={<div className="text-right text-primary"><h3>Project Repositories</h3></div>}
        columns={columns}
        customStyles={customStyles}
        data={data}
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
      <Button href="/projects" className="m-3 bg-dark">Back</Button>
    </div>)
};
