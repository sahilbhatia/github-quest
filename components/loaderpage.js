import { Spinner } from "react-bootstrap";
import styeled from "styled-components";

const Wrapper = styeled.div`
position: fixed;
top: 50%;
left: 50%;
`;
export default function LoadingComponent() {
  return (
    <Wrapper className="text-center">
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </Wrapper>
  )
};
