import { Button, Dropdown, DropdownButton, Form } from "react-bootstrap";
import _ from "lodash";
import DatePicker from "react-datepicker";
export default function Index({ filter, setFilter }) {
  let searchUserName;
  let serachRepoName;

  var bounced = _.debounce(function () {
    let data = { ...filter };
    if (searchUserName) {
      data.userName = searchUserName;
      setFilter(data);
    } else if (serachRepoName) {
      data.repoName = serachRepoName;
      setFilter(data);
    }
  }, 2000);
  const setUserName = (userName) => {
    if (userName.length >= 3) {
      searchUserName = userName
      bounced();
    }
  };

  const setRepoName = (repoName) => {
    if (repoName.length >= 3) {
      serachRepoName = repoName;
      bounced();
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
          className={filter.startDate != undefined ? "border-success" : ""}
        />
        <Form.Label>To :</Form.Label>
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          placeholderText="Select date to"
          className={filter.endDate != undefined ? "border-success" : ""}
        />
      </div>
      <div className="d-flex">
        <div className="mr-2 d-flex">
          <Form.Control className={filter.userName != undefined ? "border-success" : ""} size="text" placeholder="Search By User Name..." defaultValue={filter.userName} onChange={(e => setUserName(e.target.value))} />
        </div >
        <div className="mr-2 d-flex">
          <Form.Control size="text" className={filter.repoName != undefined ? "border-success" : ""} placeholder="Search By Repo Name..." defaultValue={filter.repoName} onChange={(e => setRepoName(e.target.value))} />
        </div >
        <DropdownButton className="ml-2" variant={filter.is_forked != undefined ? "success" : "dark"} title="Forked">
          <Dropdown.Item onClick={(e => forked(true))} >true</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(false))} >false</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(null))} >all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="ml-2" variant={filter.is_archived != undefined ? "success" : "dark"} title="Archived">
          <Dropdown.Item onClick={(e => archived(true))}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(false))}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(null))}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={filter.is_disabled != undefined ? "success" : "dark"} title="Disabled">
          <Dropdown.Item onClick={(e => disabled(true))}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(false))}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(null))}>all</Dropdown.Item>
        </DropdownButton>
        <Button className="ml-2" variant="light" onClick={reset}>↺</Button>
      </div>
    </div>)
};

