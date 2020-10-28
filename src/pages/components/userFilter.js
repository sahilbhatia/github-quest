import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 150px;
`;

export default function Index({ filter, setFilter, minDate }) {
  let [userName, setuserName] = useState(null);
  let userList = [];
  let userData = fetch(`/api/find-user?userName=${userName}`);
  let [gitHandle, setgitHandle] = useState(null);
  let startDate;
  let endDate;
  let selectUser;
  let selectGitHandle;
  let errorDetails;
  if (filter) {
    if (filter.startDate) startDate = new Date(filter.startDate);
    if (filter.endDate) endDate = new Date(filter.endDate);
    if (filter.userName) selectUser = filter.userName;
    if (filter.gitHandle) selectGitHandle = filter.gitHandle;
    if (filter.error_details != undefined) errorDetails = filter.error_details;
  }
  let gitHandleList = [];
  let gitHandleData = fetch(`/api/find-user?gitHandle=${gitHandle}`);
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

  gitHandleData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((user) => {
        if (user.github_handle) {
          gitHandleList.push({
            value: user.github_handle,
            label: `Github- ${user.github_handle}`,
          });
        }
        if (user.gitlab_handle) {
          gitHandleList.push({
            value: user.gitlab_handle,
            label: `Gitlab- ${user.gitlab_handle}`,
          });
        }
        if (user.bitbucket_handle) {
          gitHandleList.push({
            value: user.bitbucket_handle,
            label: `Bitbucket- ${user.bitbucket_handle}`,
          });
        }
      });
    });

  const filterOptionsGitHandle = (inputValue) => {
    return gitHandleList.filter((i) => i.label.includes(inputValue));
  };

  const promiseOptionsGitHandle = (inputValue, callback) => {
    setgitHandle(inputValue);
    setTimeout(() => {
      callback(filterOptionsGitHandle(inputValue));
    }, 1000);
  };
  const setGitHandle = (gitHandle) => {
    let data = { ...filter };
    data.gitHandle = gitHandle.value;
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

  const colourStyles = {
    option: (styles, { data }) => {
      return {
        ...styles,
        color: data.label.includes("Github")
          ? "green"
          : data.label.includes("Gitlab")
          ? "orange"
          : "blue",
      };
    },
  };

  return (
    <div>
      <div className="d-flex">
        <Wrapper>
          <AsyncSelect
            loadOptions={promiseOptionsUsers}
            name="select User"
            placeholder="Users..."
            defaultInputValue={selectUser}
            onChange={setUser}
            className="w-100"
          />
        </Wrapper>
        <Wrapper>
          <AsyncSelect
            loadOptions={promiseOptionsGitHandle}
            name="select git handel"
            placeholder="git handel..."
            defaultInputValue={selectGitHandle}
            onChange={setGitHandle}
            styles={colourStyles}
            className="w-100"
          />
        </Wrapper>
        <DatePicker
          onSelect={setDateFrom}
          selected={startDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date from"
          className="mx-1"
        />
        <DatePicker
          onSelect={setDateTo}
          selected={endDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select search date to"
          className="mx-1"
        />
        <DropdownButton
          className="mx-2"
          variant={setColor(errorDetails)}
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

Index.propTypes = {
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  minDate: PropTypes.string.isRequired,
};
