import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Link from "next/link";
import PropTypes from "prop-types";
export default function ProjectsOfUserComponent({ data }) {
  let { name, users_projects } = data;
  const columns = [
    {
      name: "Name",
      selector: function func(d) {
        return (
          <div>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>{d.project.name}</Tooltip>}
            >
              <span>{d.project.name}</span>
            </OverlayTrigger>
          </div>
        );
      },
    },
    {
      name: "Active Users",
      selector: function func(d) {
        return d.project.users_projects.length != 0 ? (
          <Link
            href="/project-users/[projectId]"
            as={`/project-users/${d.project.id}`}
          >
            <Button className="bg-white border-white text-primary btn-sm">
              {d.project.users_projects.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
    {
      name: "Repositories",
      selector: function func(d) {
        return d.project.projects_repositories.length != 0 ? (
          <Link
            href="/project-repositories/[projectId]"
            as={`/project-repositories/${d.project.id}`}
          >
            <Button className="bg-white border-white text-primary btn-sm">
              {d.project.projects_repositories.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
    {
      name: "Active",
      selector: function func(d) {
        return d.project.is_active ? (
          <span className="text-success">✔</span>
        ) : (
          <span className="text-danger">✘</span>
        );
      },
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
        color: "white",
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
        title={
          <div className="text-right text-primary">
            <h3>
              projects of user <span className="text-success">{name}</span>
            </h3>
          </div>
        }
        columns={columns}
        customStyles={customStyles}
        data={users_projects}
      />
      <Button href="/projects" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

ProjectsOfUserComponent.propTypes = {
  data: PropTypes.object.isRequired,
};
