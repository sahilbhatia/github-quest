import  React from 'react'
import { Spinner } from "react-bootstrap";
export default function LoadingPage() {
  return (
    <div data-testid="spinner" style={{ position: "fixed", top: "50%", left: "50%" }} className="text-center">
      <Spinner animation="border" role="status" />
    </div>
  )
};
