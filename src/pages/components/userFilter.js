import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import PropTypes from "prop-types";
export default function Index({ filter, setFilter, minDate }) {
  let [userName, setuserName] = useState(null);
  let userList = [];
  let userData = fetch(`/api/findUser?userName=${userName}`);
  let [githubHandle, setgithubHandle] = useState(null);
  let githubHandleList = [];
  let githubHandleData = fetch(`/api/findUser?githubHandle=${githubHandle}`);
  userData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((user) =>
        userList.push({
          value: user.name,
          label: user.name,
        })
      );
    });

  const filterOptionsUsers = (inputValue) => {
    return userList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsUsers = (inputValue, callback) => {
    setuserName(inputValue);
    setTimeout(() => {
      callback(filterOptionsUsers(inputValue));
    }, 1000);
  };
  const setUser = (userName) => {
    let data = { ...filter };
    data.userName = userName.value;
    setFilter(data);
  };

  githubHandleData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((user) =>
        githubHandleList.push({
          value: user.github_handle,
          label: user.github_handle,
        })
      );
    });

  const filterOptionsGithubHandle = (inputValue) => {
    return githubHandleList.filter((i) => i.label.includes(inputValue));
  };

  const promiseOptionsGithubHandle = (inputValue, callback) => {
    setgithubHandle(inputValue);
    setTimeout(() => {
      callback(filterOptionsGithubHandle(inputValue));
    }, 1000);
  };
  const setGithubHandle = (githubHandle) => {
    let data = { ...filter };
    data.githubHandle = githubHandle.value;
    setFilter(data);
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
  const errorStatus = (value) => {
    let data = { ...filter };
    data.error_details = value;
    setFilter(data);
  };
  const setColor = (status) => {
    switch (status != undefined ? status.toString() : status) {
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
        <div style={{ width: "150px" }}>
          <AsyncSelect
            loadOptions={promiseOptionsUsers}
            name="select User"
            placeholder="Users..."
            defaultInputValue={filter.userName}
            onChange={setUser}
            className="w-100"
          />
        </div>
        <div style={{ width: "150px" }}>
          <AsyncSelect
            loadOptions={promiseOptionsGithubHandle}
            name="select github handel"
            placeholder="github handel..."
            defaultInputValue={filter.githubHandle}
            onChange={setGithubHandle}
            className="w-100"
          />
        </div>
        <DatePicker
          onSelect={(e) => setDateFrom(e)}
          selected={filter.startDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date from"
          className={`${
            filter.startDate != undefined ? "border-success" : ""
          } mx-1`}
        />
        <DatePicker
          onSelect={(e) => setDateTo(e)}
          selected={filter.endDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date to"
          className={`${
            filter.endDate != undefined ? "border-success" : ""
          } mx-1`}
        />
        <DropdownButton
          className="mx-2"
          variant={setColor(filter.error_details)}
          title="Error Status"
        >
          <Dropdown.Item
            onClick={() => errorStatus(true)}
            className="bg-success"
          >
            true
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => errorStatus(false)}
            className="bg-danger"
          >
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => errorStatus(undefined)}
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

Index.prototype = {
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  minDate: PropTypes.string.isRequired,
};
