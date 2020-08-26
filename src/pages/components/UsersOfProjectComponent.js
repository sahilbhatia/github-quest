import DataTable from "react-data-table-component";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import Pagination from "../components/pagination"
import Link from "next/link";
import PropTypes from "prop-types";
export default function UsersOfProjectComponent({
  limit,
  offset,
  setOffset,
  setLimit,
  data,
}) {
  const projectName = data.projectName;
  data = data.users;
  const columns = [
    {
      name: 'Name',
      selector: d => <div>
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
        </OverlayTrigger></div>
    },
    {
      name: "Github Handle",
      selector: d => d.github_handle ? d.github_handle : "not provided"
    },
    {
      name: "Email",
      selector: "email"
    },
    {
      name: "Projects",
      selector: d => d.users_projects.length != 0 ? <Link href="/getProjects/[userId]" as={`/getProjects/${d.id}`}><a>{d.users_projects[0].user.users_projects.length}</a></Link> : <>✘</>,
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
        title={<div className="text-right text-primary"><h3>Users of project <a className="text-success">{projectName}</a></h3></div>}
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

UsersOfProjectComponent.prototype = {
  data: PropTypes.array.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};

