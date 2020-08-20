import useSWR from 'swr';
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import { Tooltip, OverlayTrigger} from "react-bootstrap";
import ErrorComponent from "../components/errorpage"
import LoadingComponent from "../components/loaderpage";
let code;
const fetcher = (url) => fetch(url).then((res) =>{code=res.status; return res.json()})

export default function Post() {
  let { data, error } = useSWR(`/api/getUserErrors`, fetcher);
  if (error || code==400 || code==404 || code==500) return <ErrorComponent code={code}/>
  if (!data) return <LoadingComponent/>
  const columns = [
    {
      name: 'User Name',
      selector: d => d.user.name
    },
    {
      name: 'Github Handle',
      selector: d => d.user.github_handle
    },

    {
      name: 'Email',
      selector: d => d.user.email
    },
    {
      name: 'Error Details',
      selector: d => <OverlayTrigger
      placement="top"
      delay={{ show: 250, hide: 400 }}
      overlay={
        <Tooltip>
          {d.error}
        </Tooltip>
      }
    >
      <span>
        {d.error}
      </span>
    </OverlayTrigger>
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
        color: "white"
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
        title="errors"
        columns={columns}
        customStyles={customStyles}
        data={data}
        highlightOnHover
      />
      <Button href="/" className="m-3 bg-dark">Back</Button>
    </div>)
};
