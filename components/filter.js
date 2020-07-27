import { useState } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
export default function Index() {
  
  return (
    <div className="d-flex">
       <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"></link>
      <DropdownButton className="ml-2" variant="dark" title="Forked">
          <Dropdown.Item >true</Dropdown.Item>
          <Dropdown.Item >false</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="ml-2" variant="dark" title="Archived">
          <Dropdown.Item >true</Dropdown.Item>
          <Dropdown.Item >false</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="ml-2" variant="dark" title="Disabled">
          <Dropdown.Item >true</Dropdown.Item>
          <Dropdown.Item >false</Dropdown.Item>
        </DropdownButton>
        <Button className="ml-2" variant="light">↺</Button>
     
    </div>)
};
