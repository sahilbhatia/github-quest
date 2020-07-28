import { Button, Dropdown, DropdownButton, FormControl, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
export default function Index({ filter, setFilter }) {
  const setUserName = (userName) => {
    if(userName.length %3 ==0){
    let data = { ...filter };
    data.userName = userName;
    setFilter(data);
    }
  };
  const setRepoName = (repoName) => {
    if(repoName.length %3 == 0){
    let data = { ...filter };
    data.repoName = repoName;
    setFilter(data);
    }
  };
  const reset = () => {
    setFilter({});
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
          onSelect={(e) => setDateFrom(e)}
          selected={filter.startDate}
          maxDate={new Date()}
          placeholderText="Select date from"
        />
        <Form.Label>To :</Form.Label>
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          placeholderText="Select date to"
        />
      </div>
      <div className="d-flex">
        <div className="mr-2 d-flex">
          <Form.Control size="text" placeholder="Search By User Name..." defaultValue={filter.userName} onChange={(e => setUserName(e.target.value))} />
        </div >
        <div className="mr-2 d-flex">
          <Form.Control size="text" type="text" placeholder="Search By Repo Name..." defaultValue={filter.repoName} onChange={(e => setRepoName(e.target.value))} />
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

