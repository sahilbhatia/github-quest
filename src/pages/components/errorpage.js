import React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

const Wrapper = styled.div`
  height: 100vh;
`;

const ErrorCode = styled.h1`
  font-size: 1000%;
`;
const errorMassage = (code) => {
  switch (code) {
    case 400:
      return {
        statusCode:400,
        errorCode: "VALIDATION_ERROR",
        errorMassage: "Sorry but you passed wrong information ...!"
      }
    case 404:
      return {
        statusCode:404,
        errorCode: "DATA_NOT_FOUND",
        errorMassage: "Sorry but the data which you are trying to access is not available ...!"
      }
    case 500:
      return {
        statusCode:500,
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMassage: "Sorry but something happen wrong when retrieving the data ...!"
      }
    default:
      return {
        statusCode:"",
        errorCode: "ERROR",
        errorMassage: "Sorry something happen wrong ...!"
      }
  }

}

export default function ErrorComponent({ code }) {
  let err = errorMassage(code);
  return (
    <Wrapper className="d-flex justify-content-center align-items-center">
      <div>
        <ErrorCode className="font-weight-bold text-muted">{err.statusCode}</ErrorCode>
        <h2>Oops! {err.errorCode}</h2>
        <p>
          {err.errorMassage}
        </p>
        <Button href="/">Go To Homepage</Button>
      </div>
    </Wrapper>
  );
};

ErrorComponent.propTypes = {
  code: PropTypes.number.isRequired,
};
