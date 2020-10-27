import React from "react";
import { Spinner } from "react-bootstrap";
import styled from "styled-components";

const Wrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
`;

export default function LoadingPage() {
  return (
    <Wrapper data-testid="spinner" className="text-center">
      <Spinner animation="border" role="status" />
    </Wrapper>
  );
}
