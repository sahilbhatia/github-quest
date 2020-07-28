import { useState } from "react";
import { Button, Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
export default function Index({ filter, setFilter }) {
  const setName = (value) => {
    if (value.length >= 3) {
      let data = { ...filter };
      data.name = value;
      setFilter(data);
    }
  };
  const reset = () => {
    setFilter({});
  };
  const setDateFrom = (value) => {
    let myDate = value.replace(/-/g,"/")
    let data = { ...filter };
    data.startDate = value;
    setFilter(data);
  };
  const setDateTo = (value) => {
    let data = { ...filter };
    data.endDate = value;
    setFilter(data);
  };
  const forked = (value) => {
    let data = { ...filter };
    data.is_forked = value;
    setFilter(data);
  };
  const archived = (value) => {
    let data = { ...filter };
    data.is_archived = value;
    setFilter(data)
  };
  const disabled = (value) => {
    let data = { ...filter };
    data.is_disabled = value;
    setFilter(data)
  };
  return (
    <div className="d-flex">
      <FormControl placeholder="Search by Name.." className="bg-dark text-white mr-2" onChange={(e) => setName(e.target.value)} />
      <div className="bg-dark text-white text-center"> <label>From :</label><input type="date" onChange={(e) => setDateFrom(e.target.value)} /></div>
      <div className="bg-dark text-white text-center"> <label>To :</label><input type="date" onChange={(e) => setDateTo(e.target.value)} /></div>
      <DropdownButton className="ml-2" variant="dark" title="Forked">
        <Dropdown.Item onClick={(e => forked(true))} >true</Dropdown.Item>
        <Dropdown.Item onClick={(e => forked(false))} >false</Dropdown.Item>
        <Dropdown.Item onClick={(e => forked(null))} >all</Dropdown.Item>
      </DropdownButton>
      <DropdownButton className="ml-2" variant="dark" title="Archived">
        <Dropdown.Item onClick={(e => archived(true))}>true</Dropdown.Item>
        <Dropdown.Item onClick={(e => archived(false))}>false</Dropdown.Item>
        <Dropdown.Item onClick={(e => archived(null))}>all</Dropdown.Item>
      </DropdownButton>
      <DropdownButton className="ml-2" variant="dark" title="Disabled">
        <Dropdown.Item onClick={(e => disabled(true))}>true</Dropdown.Item>
        <Dropdown.Item onClick={(e => disabled(false))}>false</Dropdown.Item>
        <Dropdown.Item onClick={(e => disabled(null))}>all</Dropdown.Item>
      </DropdownButton>
      <Button className="ml-2" variant="light" onClick={reset}>↺</Button>
    </div>)
};
