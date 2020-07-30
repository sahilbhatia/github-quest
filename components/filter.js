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
  return (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <Form.Label>From :</Form.Label>
        <DatePicker
          onSelect={(e) => setDateFrom(e)}
          selected={filter.startDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select date from"
          className={filter.startDate != undefined ? "border-success" : ""}
        />
        <Form.Label>To :</Form.Label>
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
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
          <Dropdown.Item onClick={(e => forked(true))} className={filter.is_forked ? "bg-info" : ""}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(false))} className={filter.is_forked ==false ? "bg-info" : ""} >false</Dropdown.Item>
          <Dropdown.Item onClick={(e => forked(null))} className={filter.is_forked == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="ml-2" variant={filter.is_archived != undefined ? "success" : "dark"} title="Archived">
          <Dropdown.Item onClick={(e => archived(true))} className={filter.is_archived ? "bg-info" : ""}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(false))} className={filter.is_archived ==false ? "bg-info" : ""}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => archived(null))} className={filter.is_archived == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={filter.is_disabled != undefined ? "success" : "dark"} title="Disabled">
          <Dropdown.Item onClick={(e => disabled(true))} className={filter.is_disabled ? "bg-info" : ""}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(false))} className={filter.is_disabled ==false ? "bg-info" : ""}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => disabled(null))} className={filter.is_disabled == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={filter.is_suspicious != undefined ? "success" : "dark"} title="Suspicious">
          <Dropdown.Item onClick={(e => suspicious(true))} className={filter.is_suspicious ? "bg-info" : ""}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => suspicious(false))} className={filter.is_suspicious ==false ? "bg-info" : ""}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => suspicious(null))} className={filter.is_suspicious == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={filter.is_private != undefined ? "success" : "dark"} title="Private">
          <Dropdown.Item onClick={(e => privateRepo(true))} className={filter.is_private ? "bg-info" : ""}>true</Dropdown.Item>
          <Dropdown.Item onClick={(e => privateRepo(false))} className={filter.is_private ==false ? "bg-info" : ""}>false</Dropdown.Item>
          <Dropdown.Item onClick={(e => privateRepo(null))} className={filter.is_private == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DropdownButton className="mx-2" variant={filter.review != undefined ? "success" : "dark"} title="Review Status">
          <Dropdown.Item onClick={(e => review("suspicious auto"))} className={filter.review == "suspicious auto" ? "bg-info" : ""}>suspicious(auto)</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("suspicious manual"))} className={filter.review == "suspicious manual"? "bg-info" : ""}>suspicious(manual)</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("approved"))} className={filter.review == "approved" ? "bg-info" : ""}>approved</Dropdown.Item>
          <Dropdown.Item onClick={(e => review("pending"))} className={filter.review == "pending" ? "bg-info" : ""}>pending</Dropdown.Item>
          <Dropdown.Item onClick={(e => review(null))} className={filter.review == undefined ? "bg-info" : ""}>all</Dropdown.Item>
        </DropdownButton>
        <DatePicker
          onSelect={(e) => setDateReview(e)}
          selected={filter.reviewDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select reviewed date"
          className={filter.reviewDate != undefined ? "border-success" : ""}
        />
        <Button className="ml-2" variant="dark" onClick={reset}>↺</Button>
      </div>
    </div>)
};
