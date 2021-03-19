import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import Pagination from "../components/pagination";
import PropTypes from "prop-types";
export default function ProjectRepositoryComponent({
  data,
  limit,
  setLimit,
  offset,
  setOffset,
}) {
  let projectName = data ? data.projectName : undefined;
  data = data ? data.repositories : undefined;
  const columns = [
    {
      name: "Host",
      selector: (d) =>
        d.source_type != null ? d.source_type : "host not provided",
    },
    {
      name: "url",
      selector: (d) => (d.url != null ? d.url : "url not provided"),
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
              Repositories of project{" "}
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

ProjectRepositoryComponent.propTypes = {
  data: PropTypes.object.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};
