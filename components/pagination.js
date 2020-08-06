import { Button, Dropdown, DropdownButton } from "react-bootstrap";
export default function Index({ limit, offset, setLimit, setOffset, data }) {
  const prev = () => {
    offset = offset - limit <= 0 ? 0 : offset - limit;
    setOffset(offset);
  };
  const next = () => {
    offset = data.length < limit ? offset : offset + limit;
    setOffset(offset);
  };
  return (
    <div className="d-flex justify-content-end my-3">
      <DropdownButton variant="light" title={`Rows per page: ${limit}`}>
        <Dropdown.Item onClick={() => setLimit(10)}>10</Dropdown.Item>
        <Dropdown.Item onClick={() => setLimit(15)}>15</Dropdown.Item>
        <Dropdown.Item onClick={() => setLimit(20)}>20</Dropdown.Item>
      </DropdownButton>
      
        {offset == 0 
          ? <></>
          : <Button onClick={prev} className=" ml-5 bg-white text-dark">&laquo; {offset - limit < 0 ? <>{`0 - ${limit}`}</> : <>{`${offset - limit + 1} - ${offset}`}</>}</Button>}
        {data.length < limit 
          ? <></>
          : <Button onClick={next} className="mx-5 bg-white text-dark">{`${offset + limit + 1} - ${limit + offset + limit}`} &raquo;</Button>}
    </div>
  )
};
