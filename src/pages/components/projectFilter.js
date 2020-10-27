import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 150px;
`;

export default function Index({ filter, setFilter, minDate }) {
  let [projectName, setProjectName] = useState(null);
  let startDate;
  let endDate;
  if (filter) {
    if (filter.startDate) startDate = new Date(filter.startDate);
    if (filter.endDate) endDate = new Date(filter.endDate);
  }
  let projectList = [];
  let projectData = fetch(`/api/find-project?projectName=${projectName}`);

  projectData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((project) =>
        projectList.push({
          value: project.name,
          label: project.name,
        })
      );
    });

  const filterOptionsProjects = (inputValue) => {
    return projectList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsProjects = (inputValue, callback) => {
    setProjectName(inputValue);
    setTimeout(() => {
      callback(filterOptionsProjects(inputValue));
    }, 1000);
  };

  const setProject = (projectName) => {
    let data = { ...filter };
    data.projectName = projectName.value;
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

  const showActiveProjects = () => {
    let data = { ...filter };
    data.is_active = true;
    setFilter(data);
  };

  const showInActiveProjects = () => {
    let data = { ...filter };
    data.is_active = false;
    setFilter(data);
  };

  const showAllProjects = () => {
    let data = { ...filter };
    data.is_active = undefined;
    setFilter(data);
  };

  const setColor = () => {
    switch (
      filter.is_active != undefined ? filter.is_active.toString() : undefined
    ) {
      case "false":
        return "danger";
      case "true":
        return "success";
      default:
        return "dark";
    }
  };
  return (
    <div>
      <div className="d-flex">
        <Wrapper>
          <AsyncSelect
            loadOptions={promiseOptionsProjects}
            name="select project"
            placeholder="project..."
            defaultInputValue={filter.projectName}
            onChange={setProject}
            className="w-100"
          />
        </Wrapper>
        <DatePicker
          onSelect={setDateFrom}
          selected={startDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select from"
          className="mx-1"
        />
        <DatePicker
          onSelect={setDateTo}
          selected={endDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select to"
          className="mx-1"
        />
        <DropdownButton className="ml-2" variant={setColor()} title="active">
          <Dropdown.Item onClick={showActiveProjects} className="bg-success">
            true
          </Dropdown.Item>
          <Dropdown.Item onClick={showInActiveProjects} className="bg-danger">
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={showAllProjects}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <Button className="ml-2" variant="dark" onClick={reset}>
          ↺
        </Button>
      </div>
    </div>
  );
}

Index.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  minDate: PropTypes.string.isRequired,
};
