import { Button, Dropdown, DropdownButton } from "react-bootstrap";
export default function Index({ limit, offset, setLimit, setOffset, data }) {
  const prev = () => {
    offset = offset <= 0 ? 0 : offset - limit <= 0 ? 0 : offset - limit;
    setOffset(offset);
  };
  const next = () => {
    offset = data.length < limit ? offset : offset + limit;
    setOffset(offset);
  };
  return (
    <div className="d-flex justify-content-end">
      <DropdownButton variant="light" title={`Rows per page: ${limit ? limit : "All"}`}>
        <Dropdown.Item onClick={() => setLimit(5)}>5</Dropdown.Item>
        <Dropdown.Item onClick={() => setLimit(10)}>10</Dropdown.Item>
        <Dropdown.Item onClick={() => setLimit(15)}>15</Dropdown.Item>
        <Dropdown.Item onClick={() => { setLimit(null); setOffset(0) }}>All</Dropdown.Item>
      </DropdownButton>
      <Button onClick={prev} className=" ml-5 bg-white text-dark">
        {offset == 0 || data.length > limit
          ? <span className="text-muted">&laquo;</span>
          : <span>&laquo; {offset - limit < 0 ? <>{`0 - ${limit}`}</> : <>{`${offset - limit + 1} - ${offset}`}</>}</span>}
      </Button>
      <Button onClick={next} className="mx-5 bg-white text-dark">
        {data.length < limit || data.length > limit
          ? <>&raquo;</>
          : <>{`${offset + limit + 1} - ${limit + offset + limit}`} &raquo;</>}
      </Button>
    </div>
  )
};
