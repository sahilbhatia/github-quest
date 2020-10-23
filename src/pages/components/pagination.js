import React, { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  Button,
  Dropdown,
  DropdownButton,
  Col,
  Form,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";

const DisableButton = styled(Button)`
  ${(props) => `pointer-events:${props.event ? "none" : "all"}`}
`;

export default function Index({
  limit,
  offset,
  setLimit,
  setOffset,
  data,
  count,
  perPage,
}) {
  const [pageNo, setPageNo] = useState(0);
  const [disableJump, setDisableJump] = useState(false);
  let maxPage = count / limit + 1;
  let defaultPageNo = (offset + limit) / limit;
  let nextDisable = data.length < limit || offset == count - limit;
  let prevDisable = offset == 0;
  let firstDot = offset <= 2 * limit;
  let lastDot = count - offset <= 2 * limit;
  let lastPageOffset =
    (count - limit) % limit == 0
      ? count - limit
      : count - ((count - limit) % limit);
  let pageValue = Math.trunc((offset + limit) / limit);
  let lastPage = Math.trunc(count / limit) + 1;

  const prev = () => {
    offset = offset - limit <= 0 ? 0 : offset - limit;
    setOffset(offset);
  };

  const next = () => {
    offset = data ? (data.length < limit ? offset : offset + limit) : 0;
    setOffset(offset);
  };

  const hiddenOption = {
    firstButton: offset == 0 || offset == limit,
    middleButton: count - offset <= limit,
    lastButton: count - offset <= 2 * limit,
  };

  const validatePageNo = (e) => {
    if (
      parseInt(e.target.value) < 1 ||
      parseInt(e.target.value) >= count / limit + 1
    ) {
      setDisableJump(true);
    } else {
      setDisableJump(false);
      setPageNo(e.target.value * limit - limit);
    }
  };
  return (
    <div>
      <Col className="pt-3">
        {count && (
          <>
            showing {offset + 1} to {offset + data.length} of {count} entries
          </>
        )}
      </Col>
      <Col className="d-flex justify-content-end">
        <DropdownButton variant="light" title={`Rows per page: ${limit}`}>
          {perPage.map((number, Index) => (
            <Dropdown.Item key={Index} onClick={() => setLimit(number)}>
              {number}
            </Dropdown.Item>
          ))}
        </DropdownButton>
        <Form.Control
          onChange={validatePageNo}
          style={{ width: "80px" }}
          placeholder={defaultPageNo}
          className="mr-1"
          type="number"
          min={1}
          max={maxPage}
        />
        <OverlayTrigger
          placement="top"
          delay={{ show: 250, hide: 400 }}
          overlay={<Tooltip hidden={!disableJump}>Exceeds page limit</Tooltip>}
        >
          <span>
            <DisableButton
              onClick={() => setOffset(pageNo)}
              disabled={disableJump}
              event={disableJump}
            >
              jump on
            </DisableButton>
          </span>
        </OverlayTrigger>
        <Button
          onClick={prev}
          className=" ml-5 bg-white text-dark"
          disabled={prevDisable}
        >
          &laquo; previous
        </Button>
        {count && (
          <>
            <Button
              onClick={() => setOffset(0)}
              className="ml-2"
              variant="white"
              hidden={!offset}
            >
              1
            </Button>
            {!firstDot && <span className="mx-2">...</span>}
            <Button
              onClick={() => setOffset(offset - limit)}
              className="ml-2"
              variant="white"
              hidden={hiddenOption.firstButton}
            >
              {pageValue - 1}
            </Button>
            <Button
              onClick={() => setOffset(offset)}
              className="ml-2"
              variant="dark"
            >
              {pageValue}
            </Button>
            <Button
              onClick={() => setOffset(offset + limit)}
              className="ml-2"
              variant="white"
              hidden={hiddenOption.middleButton}
            >
              {pageValue + 1}
            </Button>
            {!lastDot && <span className="mx-2">...</span>}
            <Button
              onClick={() => setOffset(lastPageOffset)}
              variant="white"
              hidden={hiddenOption.lastButton}
            >
              {lastPage}
            </Button>
          </>
        )}
        <Button
          onClick={next}
          className="mx-2 bg-white text-dark"
          disabled={nextDisable}
        >
          next &raquo;
        </Button>
      </Col>
    </div>
  );
}

Index.propTypes = {
  data: PropTypes.array.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  perPage: PropTypes.array,
  setOffset: PropTypes.func.isRequired,
  setLimit: PropTypes.func.isRequired,
};

Index.defaultProps = {
  perPage: [10, 15, 20, 50, 100, 200],
};
