import { Button, Dropdown, DropdownButton, Form } from "react-bootstrap";
import _ from "lodash";
import DatePicker from "react-datepicker";

export default function Index({ filter, setFilter, minDate }) {
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
    window.location.reload();
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
  const setDateReview = (value) => {
    let data = { ...filter };
    data.reviewDate = value;
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
  const suspicious = (value) => {
    let data = { ...filter };
    data.is_suspicious = value;
    setFilter(data)
  };
  const privateRepo = (value) => {
    let data = { ...filter };
    data.is_private = value;
    setFilter(data)
  };
  const review = (value) => {
    let data = { ...filter };
    data.review = value;
    setFilter(data)
  };
  const errorStatus = (value) => {
    let data = { ...filter };
    data.error_details = value;
    setFilter(data)
  };
  const setColor = (status) => {
    switch (status!=undefined?status.toString():status) {
      case "suspicious auto" : return "danger"
      case "suspicious manual": return "warning"
      case "approved": return "success"
      case "no action": return "secondary"
      case "pending": return "primary"
      case "false" : return "danger"
      case "true" : return "success"  
      default : return "dark"
    }
  };
  return (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <DatePicker
          onSelect={(e) => setDateFrom(e)}
          selected={filter.startDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date from"
          className={`${filter.startDate != undefined ? "border-success" : ""} mx-1`}
        />
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date to"
          className={`${filter.endDate != undefined ? "border-success" : ""} mx-1`}
        />
        <DatePicker
          onSelect={(e) => setDateReview(e)}
          selected={filter.reviewDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select reviewed date"
          className={`${filter.reviewDate != undefined ? "border-success" : ""} mx-1`}
        />
      </div>
      <div className="d-flex">
        <div className="mr-2 d-flex">
          <Form.Control className={filter.userName != undefined ? "border-success" : ""} size="text" placeholder="User Name..." defaultValue={filter.userName} onChange={(e => setUserName(e.target.value))} />
        </div >
        <div className="mr-2 d-flex">
          <Form.Control size="text" className={filter.repoName != undefined ? "border-success" : ""} placeholder="Repo Name..." defaultValue={filter.repoName} onChange={(e => setRepoName(e.target.value))} />
        </div >
        <DropdownButton className="ml-2" variant={setColor(filter.is_forked)} title="Forked">
          <Dropdown.Item onClick={(e => forked(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(false))} className="bg-danger" >false</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="ml-2" variant={setColor(filter.is_archived)} title="Archived">
          <Dropdown.Item onClick={(e => archived(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={setColor(filter.is_disabled)} title="Disabled">
          <Dropdown.Item onClick={(e => disabled(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={setColor(filter.is_suspicious)} title="Suspicious">
          <Dropdown.Item onClick={(e => suspicious(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => suspicious(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => suspicious(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={setColor(filter.is_private)} title="Private">
          <Dropdown.Item onClick={(e => privateRepo(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => privateRepo(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => privateRepo(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={setColor(filter.review)} title="Review Status">
          <Dropdown.Item onClick={(e => review("suspicious auto"))} className="bg-danger">suspicious(auto)</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("suspicious manual"))} className="bg-warning">suspicious(manual)</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("approved"))} className="bg-success">approved</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("pending"))} className="bg-primary">pending</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("no action"))} className="bg-secondary">no action</Dropdown.Item>
          <Dropdown.Item onClick={(e => review(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={setColor(filter.error_details)} title="Error Status">
          <Dropdown.Item onClick={(e => errorStatus(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => errorStatus(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => errorStatus(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <Button className="ml-2" variant="dark" onClick={reset}>↺</Button>
      </div>
    </div>)
};
