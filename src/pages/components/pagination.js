import React from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, DropdownButton, Col } from "react-bootstrap";
import PageOption from "./pageOption";
export default function Index({
  limit,
  offset,
  setLimit,
  setOffset,
  data,
  count,
}) {
  const prev = () => {
    offset = offset - limit <= 0 ? 0 : offset - limit;
    setOffset(offset);
  };
  const next = () => {
    offset = data ? (data.length < limit ? offset : offset + limit) : 0;
    setOffset(offset);
  };
  return (
    <div>
      <Col className="pt-3">
        showing {offset + 1} to {offset + data.length} of {count} entries
      </Col>
      <Col className="d-flex justify-content-end">
        <DropdownButton variant="light" title={`Rows per page: ${limit}`}>
          <Dropdown.Item onClick={() => setLimit(10)}>10</Dropdown.Item>
          <Dropdown.Item onClick={() => setLimit(15)}>15</Dropdown.Item>
          <Dropdown.Item onClick={() => setLimit(20)}>20</Dropdown.Item>
        </DropdownButton>
        {offset == 0 ? (
          <Button onClick={prev} className=" ml-5 bg-white text-dark" disabled>
            &laquo;{"previous"}
          </Button>
        ) : (
          <Button onClick={prev} className=" ml-5 bg-white text-dark">
            &laquo; previous
          </Button>
        )}
        {count ? (
          <>
            <Button
              onClick={() => setOffset(0)}
              className="ml-2"
              variant={offset == 0 ? "dark" : "white"}
              hidden={offset == 0}
            >
              1
            </Button>
            {offset <= 2 * limit ? <></> : <span className="mx-2">...</span>}
            <PageOption
              limit={limit}
              setOffset={setOffset}
              offset={offset}
              count={count}
            />
            {count - offset <= 2 * limit ? (
              <></>
            ) : (
              <span className="mx-2">...</span>
            )}
            <Button
              onClick={() =>
                setOffset(
                  (count - limit) % limit == 0
                    ? count - limit
                    : count - ((count - limit) % limit)
                )
              }
              variant={offset == count - limit ? "dark" : "white"}
              hidden={count - offset <= 2 * limit}
            >
              {Math.trunc(count / limit) + 1}
            </Button>
          </>
        ) : (
          <></>
        )}
        {data ? (
          data.length < limit || offset == count - limit ? (
            <Button onClick={next} className="mx-2 bg-white text-dark" disabled>
              next &raquo;
            </Button>
          ) : (
            <Button onClick={next} className="mx-2 bg-white text-dark">
              next &raquo;
            </Button>
          )
        ) : (
          <></>
        )}
      </Col>
    </div>
  );
}

Index.propTypes = {
  data: PropTypes.array.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};
