import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Pagination from "../components/pagination";
import Link from "next/link";
import PropTypes from "prop-types";
export default function UsersOfProjectComponent({
  limit,
  offset,
  setOffset,
  setLimit,
  data,
}) {
  const projectName = data ? data.projectName : undefined;
  data = data ? data.users : undefined;
  const columns = [
    {
      name: "Name",
      selector: function func(d) {
        return (
          <div>
            <OverlayTrigger
              placement="top"
              delay={{ show: 250, hide: 400 }}
              overlay={<Tooltip>{d.name}</Tooltip>}
            >
              <span>{d.name}</span>
            </OverlayTrigger>
          </div>
        );
      },
    },
    {
      name: "Github Handle",
      selector: (d) => (d.github_handle ? d.github_handle : "not provided"),
    },
    {
      name: "Gitlab Handle",
      selector: (d) => (d.gitlab_handle ? d.gitlab_handle : "not provided"),
    },
    {
      name: "Github Handle",
      selector: (d) =>
        d.bitbucket_handle ? d.bitbucket_handle : "not provided",
    },
    {
      name: "Email",
      selector: "email",
    },
    {
      name: "Projects",
      selector: function func(d) {
        return d.users_projects.length != 0 ? (
          <Link href="/user-projects/[userId]" as={`/user-projects/${d.id}`}>
            <Button className="bg-white border-white text-primary btn-sm">
              {d.users_projects[0].user.users_projects.length}
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
        return d.users_repositories.length != 0 ? (
          <Link
            href="/user-repositories/[userId]"
            as={`/user-repositories/${d.id}`}
          >
            <Button className="bg-white border-white text-primary btn-sm">
              {d.users_repositories.length}
            </Button>
          </Link>
        ) : (
          <>✘</>
        );
      },
    },
  ];
  const customStyles = {
    rows: {
      style: {
        color: "blue",
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
              Users of project{" "}
              <span className="text-success">{projectName}</span>
            </h3>
          </div>
        }
        columns={columns}
        customStyles={customStyles}
        data={data}
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
      <Button href="/projects" className="m-3 bg-dark">
        Back
      </Button>
    </div>
  );
}

UsersOfProjectComponent.propTypes = {
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};
