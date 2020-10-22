import React from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
export default function Index({
  limit,
  offset,
  setLimit,
  setOffset,
  data,
  perPage,
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
    <div className="d-flex justify-content-end my-3">
      <DropdownButton variant="light" title={`Rows per page: ${limit}`}>
        {perPage.map((number, Index) => (
          <Dropdown.Item key={Index} onClick={() => setLimit(number)}>
            {number}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      {offset == 0 ? (
        <></>
      ) : (
        <Button onClick={prev} className=" ml-5 bg-white text-dark">
          &laquo;{" "}
          {offset - limit < 0 ? (
            <>{`0 - ${limit}`}</>
          ) : (
            <>{`${offset - limit + 1} - ${offset}`}</>
          )}
        </Button>
      )}
      {data ? (
        data.length < limit ? (
          <></>
        ) : (
          <Button onClick={next} className="mx-5 bg-white text-dark">
            {`${offset + limit + 1} - ${limit + offset + limit}`} &raquo;
          </Button>
        )
      ) : (
        <></>
      )}
    </div>
  );
}

Index.propTypes = {
  data: PropTypes.array.isRequired,
  limit: PropTypes.number.isRequired,
  perPage: PropTypes.array,
  offset: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};

Index.defaultProps = {
  perPage: [10, 15, 20, 50, 100, 200],
};
