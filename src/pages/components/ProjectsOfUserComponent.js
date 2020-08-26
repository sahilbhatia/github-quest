import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Link from "next/link";
import PropTypes from "prop-types";
export default function ProjectsOfUserComponent({ data }) {
  let name = data.name;
  data = data.users_projects;
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
      selector: d => d.project.users_projects.length != 0 ? <Link href="/getUsers/[projectId]" as={`/getUsers/${d.project.id}`}><a>{d.project.users_projects.length}</a></Link> : <>✘</>,
    },
    {
      name: "Repositories",
      selector: d => d.project.projects_repositories.length != 0 ? <Link href="/getProjectRepositories/[projectId]" as={`/getProjectRepositories/${d.project.id}`}><a>{d.project.projects_repositories.length}</a></Link> : <>✘</>
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
        title={<div className="text-right text-primary"><h3>projects of user <a className="text-success">{name}</a></h3></div>}
        columns={columns}
        customStyles={customStyles}
        data={data}
      />
      <Button href="/users" className="m-3 bg-dark">Back</Button>
    </div>)
};

ProjectsOfUserComponent.prototype = {
  data: PropTypes.array.isRequired,
};
