import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
export default function Index({ limit, offset, setOffset, count }) {
  return (
    <div>
      <Button
        onClick={() => setOffset(offset - limit)}
        className="ml-2"
        variant="white"
        hidden={offset == 0 || offset == limit}
      >
        {Math.trunc((offset + limit) / limit) - 1}
      </Button>
      <Button onClick={() => setOffset(offset)} className="ml-2" variant="dark">
        {Math.trunc((offset + limit) / limit)}
      </Button>
      <Button
        onClick={() => setOffset(offset + limit)}
        className="ml-2"
        variant="white"
        hidden={count - offset <= limit}
      >
        {Math.trunc((offset + limit) / limit) + 1}
      </Button>
    </div>
  );
}

Index.propTypes = {
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};
