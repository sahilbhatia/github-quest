import { useState } from "react";
import { Button, Dropdown, DropdownButton, FormControl, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
export default function Index({ filter, setFilter }) {
  let userName;
  let repoName;
  const setUserName = () => {
      let data = { ...filter };
      data.userName = userName;
      setFilter(data);
  };
  const setRepoName = () => {
      let data = { ...filter };
      data.repoName = repoName;
      setFilter(data);
  };
  const reset = () => {
    setFilter({});
    userName="";
    repoName="";
  };
  const setDateFrom = (value) => {
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
    <div>
      <div className="d-flex justify-content-end mb-2">
      <Form.Label>From :</Form.Label>
      <DatePicker
        selected={new Date()}
        onSelect={(e) => setDateFrom(e)}
      />
      <Form.Label>To :</Form.Label>
      <DatePicker
        selected={new Date()}
        onSelect={(e) => setDateTo(e)}
      /> 
      </div>
    <div className="d-flex">
      <div className="mr-2 d-flex">
        <Form.Control size="text" placeholder="User Name..." onChange={(e) =>{ userName=e.target.value}} />
        <Button variant="dark" size="sm" onClick={setUserName}>
          Search
       </Button>
      </div >
      <div className="mr-2 d-flex">
        <Form.Control size="text" type="text" placeholder="Repo Name..." onChange={(e) =>{ repoName=e.target.value}} />
        <Button variant="dark" size="sm" onClick={setRepoName}>
          Search
       </Button>
      </div >
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
      <DropdownButton className="mx-2" variant="dark" title="Disabled">
        <Dropdown.Item onClick={(e => disabled(true))}>true</Dropdown.Item>
        <Dropdown.Item onClick={(e => disabled(false))}>false</Dropdown.Item>
        <Dropdown.Item onClick={(e => disabled(null))}>all</Dropdown.Item>
      </DropdownButton>
      <Button className="ml-2" variant="light" onClick={reset}>↺</Button>
      </div>
    </div>)
};
