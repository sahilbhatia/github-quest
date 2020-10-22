import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Dropdown,
  DropdownButton,
  Col,
  Form,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
export default function Index({
  limit,
  offset,
  setLimit,
  setOffset,
  data,
  count,
}) {
  const [pageNo, setPageNo] = useState(0);
  const [disableJump, seyDisableJump] = useState(false);
  const prev = () => {
    offset = offset - limit <= 0 ? 0 : offset - limit;
    setOffset(offset);
  };
  const next = () => {
    offset = data ? (data.length < limit ? offset : offset + limit) : 0;
    setOffset(offset);
  };
  const validatePageNo = (e) => {
    if (
      parseInt(e.target.value) < 1 ||
      parseInt(e.target.value) >= count / limit + 1
    ) {
      seyDisableJump(true);
    } else {
      seyDisableJump(false);
      setPageNo(e.target.value * limit - limit);
    }
  };
  return (
    <div>
      <Col className="pt-3">
        {count ? (
          <>
            showing {offset + 1} to {offset + data.length} of {count} entries
          </>
        ) : (
          <></>
        )}
      </Col>
      <Col className="d-flex justify-content-end">
        <DropdownButton variant="light" title={`Rows per page: ${limit}`}>
          <Dropdown.Item onClick={() => setLimit(10)}>10</Dropdown.Item>
          <Dropdown.Item onClick={() => setLimit(15)}>15</Dropdown.Item>
          <Dropdown.Item onClick={() => setLimit(20)}>20</Dropdown.Item>
        </DropdownButton>
        <Form.Control
          onChange={validatePageNo}
          style={{ width: "80px" }}
          placeholder={(offset + limit) / limit}
          className="mr-1"
          type="number"
          min={1}
          max={count / limit + 1}
        />

        {disableJump ? (
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={<Tooltip>Exceeds page limit</Tooltip>}
          >
            <span>
              <Button
                onClick={() => setOffset(pageNo <= 0 ? 0 : pageNo)}
                disabled={disableJump}
                style={{ pointerEvents: "none" }}
              >
                jump on
              </Button>
            </span>
          </OverlayTrigger>
        ) : (
          <Button
            onClick={() => setOffset(pageNo <= 0 ? 0 : pageNo)}
            disabled={disableJump}
          >
            jump on
          </Button>
        )}
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
            <Button
              onClick={() => setOffset(offset - limit)}
              className="ml-2"
              variant="white"
              hidden={offset == 0 || offset == limit}
            >
              {Math.trunc((offset + limit) / limit) - 1}
            </Button>
            <Button
              onClick={() => setOffset(offset)}
              className="ml-2"
              variant="dark"
            >
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
