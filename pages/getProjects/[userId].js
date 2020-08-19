import useSWR from 'swr';
import { useRouter } from 'next/router';
import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Link from "next/link";
import ErrorComponent from "../../components/errorpage";
import LoadingComponent from "../../components/loaderpage";
let code;
const fetcher = (url) => fetch(url).then((res) => { code = res.status; return res.json() })
export default function Index() {
    const router = useRouter()
    const { userId } = router.query;
  let { data, error } = useSWR(`/api/getProjectsOfUser?&userId=${userId}`, fetcher);
  if (error || code == 400 || code == 404 || code == 500) return <ErrorComponent code={code} />
  if (!data) return <LoadingComponent />
  let name =data.name;
  data=data.users_projects;
  const columns = [
    {
      name: 'Name',
      selector: d => <div>
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={
            <Tooltip>
              {d.project.name}
            </Tooltip>
          }
        >
          <span>
            {d.project.name}
          </span>
        </OverlayTrigger></div>
    },
    {
      name: "Active Users",
      selector: d => d.project.users_projects.length !=0 ?<Link href="/getUsers/[projectId]" as={`/getUsers/${d.project.id}`}><a>{d.project.users_projects.length}</a></Link> : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.project.projects_repositories.length !=0 ?<Link href="/getProjectRepositories/[projectId]" as={`/getProjectRepositories/${d.project.id}`}><a>{d.project.projects_repositories.length}</a></Link> : <>✘</>
    },
    {
      name: "Active",
      selector: d => d.project.is_active ? <span className="text-success">✔</span> : <span className="text-danger">✘</span>
    },
  ];
  const customStyles = {
    rows: {
      style: {
        color: "black",
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
        title={<div className="text-right"><b>projects of {name}</b></div>}
        columns={columns}
        customStyles={customStyles}
        data={data}
      />
      <Button href="/users" className="m-3 bg-dark">Back</Button>
    </div>)
};
