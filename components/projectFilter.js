import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import moment from "moment";
export default function Index({ filter, setFilter }) {
  let [projectName, setProjectName] = useState(null);
  let projectList = [];
  let projectData = fetch(`/api/findProject/[findProject]?projectName=${projectName}`)

  projectData.then((response) => { return response.json() }).then((res) => {
    res.map((project) =>
      projectList.push({
        value: project.name,
        label: project.name,
      })
    );
  })

  const filterOptionsProjects = (inputValue) => {
    return projectList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsProjects = (inputValue, callback) => {
    setProjectName(inputValue)
    setTimeout(() => {
      callback(filterOptionsProjects(inputValue));
    }, 1000);
  };
  const setProject = (repoName) => {
    let data = { ...filter };
    data.repoName = repoName.value;
    setFilter(data);
  };

  const reset = () => {
    setFilter({});
    window.location.reload();
  };
  const setDateFrom = (value) => {
    let data = { ...filter };
    data.startDate = moment(value).toISOString();
    setFilter(data);
  };
  const setDateTo = (value) => {
    let data = { ...filter };
    data.endDate = moment(value).toISOString();
    setFilter(data);
  };

  const active = (value) => {
    let data = { ...filter };
    data.is_active = value;
    setFilter(data)
  };

  const setColor = (status) => {
    switch (status != undefined ? status.toString() : status) {
      case "false": return "danger"
      case "true": return "success"
      default: return "dark"
    }
  };
  return (
    <div>
      <div className="d-flex">
        <div style={{ width: "150px" }}>
          <AsyncSelect
            loadOptions={promiseOptionsProjects}
            name="select repository"
            placeholder="repository..."
            defaultInputValue={filter.projectName}
            onChange={setProject}
            className="w-100"
          />
        </div>
        <DropdownButton className="ml-2" variant={setColor(filter.is_active)} title="active">
          <Dropdown.Item onClick={(e => active(true))} className="bg-success">true</Dropdown.Item>
          <Dropdown.Item onClick={(e => active(false))} className="bg-danger">false</Dropdown.Item>
          <Dropdown.Item onClick={(e => active(undefined))} className="bg-dark text-white">all</Dropdown.Item>
        </DropdownButton>
        <DatePicker
          onSelect={(e) => setDateFrom(e)}
          selected={filter.startDate}
          maxDate={new Date()}
          placeholderText="Select search date from"
          className={`${filter.startDate != undefined ? "border-success" : ""} mx-1`}
        />
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          placeholderText="Select search date to"
          className={`${filter.endDate != undefined ? "border-success" : ""} mx-1`}
        />
        <Button className="ml-2" variant="dark" onClick={reset}>↺</Button>
      </div>
    </div>)
};
