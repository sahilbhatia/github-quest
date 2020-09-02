import React from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import PropTypes from "prop-types";

import moment from "moment";
let limit = 10;
let offset = 0;
export default function Index({ filter, setFilter, minDate }) {
  let [name, setName] = useState(null);
  let [repositoryName, setRepositoryName] = useState(null);
  let usersList = [];
  let repositoryList = [];
  let usersData = fetch(
    `/api/findUser?limit=${limit}&offset=${offset}&userName=${name}`
  );
  let reposData = fetch(
    `/api/findRepository?limit=${limit}&offset=${offset}&repositoryName=${repositoryName}&userName=${filter.userName}`
  );

  usersData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((user) =>
        usersList.push({
          value: user.name,
          label: user.name,
        })
      );
    });

  reposData
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      res.map((repo) =>
        repositoryList.push({
          value: repo.name,
          label: repo.name,
        })
      );
    });

  const setUserName = (userName) => {
    let data = { ...filter };
    data.userName = userName.value;
    setFilter(data);
  };
  const filterOptions = (inputValue) => {
    return usersList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = (inputValue, callback) => {
    setName(inputValue);
    setTimeout(() => {
      callback(filterOptions(inputValue));
    }, 1000);
  };

  const filterOptionsRepos = (inputValue) => {
    return repositoryList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsRepos = (inputValue, callback) => {
    setRepositoryName(inputValue);
    setTimeout(() => {
      callback(filterOptionsRepos(inputValue));
    }, 1000);
  };
  const setRepoName = (repoName) => {
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
    data.reviewDate = moment(value).toISOString();
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
    setFilter(data);
  };
  const disabled = (value) => {
    let data = { ...filter };
    data.is_disabled = value;
    setFilter(data);
  };
  const suspicious = (value) => {
    let data = { ...filter };
    data.is_suspicious = value;
    setFilter(data);
  };
  const privateRepo = (value) => {
    let data = { ...filter };
    data.is_private = value;
    setFilter(data);
  };
  const review = (value) => {
    let data = { ...filter };
    data.review = value;
    setFilter(data);
  };
  const errorStatus = (value) => {
    let data = { ...filter };
    data.error_details = value;
    setFilter(data);
  };
  const setColor = (status) => {
    switch (status != undefined ? status.toString() : status) {
      case "suspicious auto":
        return "danger";
      case "suspicious manual":
        return "warning";
      case "approved":
        return "success";
      case "no action":
        return "secondary";
      case "pending":
        return "primary";
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
      <div className="d-flex justify-content-end mb-2">
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
        <DatePicker
          onSelect={(e) => setDateReview(e)}
          selected={filter.reviewDate ? new Date(filter.reviewDate) : ""}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select reviewed date"
          className={`${
            filter.reviewDate != undefined ? "border-success" : ""
          } mx-1`}
        />
      </div>
      <div className="d-flex">
        <div style={{ width: "150px" }} className="mx-2">
          <AsyncSelect
            loadOptions={promiseOptions}
            name="select username"
            placeholder="username..."
            defaultInputValue={filter.userName}
            onChange={setUserName}
            className="w-100"
          />
        </div>
        <div style={{ width: "150px" }}>
          <AsyncSelect
            loadOptions={promiseOptionsRepos}
            name="select repository"
            placeholder="repository..."
            defaultInputValue={filter.repoName}
            onChange={setRepoName}
            className="w-100"
          />
        </div>
        <DropdownButton
          className="ml-2"
          variant={setColor(filter.is_forked)}
          title="Forked"
        >
          <Dropdown.Item onClick={() => forked(true)} className="bg-success">
            true
          </Dropdown.Item>
          <Dropdown.Item onClick={() => forked(false)} className="bg-danger">
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => forked(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          className="ml-2"
          variant={setColor(filter.is_archived)}
          title="Archived"
        >
          <Dropdown.Item onClick={() => archived(true)} className="bg-success">
            true
          </Dropdown.Item>
          <Dropdown.Item onClick={() => archived(false)} className="bg-danger">
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => archived(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          className="mx-2"
          variant={setColor(filter.is_disabled)}
          title="Disabled"
        >
          <Dropdown.Item onClick={() => disabled(true)} className="bg-success">
            true
          </Dropdown.Item>
          <Dropdown.Item onClick={() => disabled(false)} className="bg-danger">
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => disabled(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          className="mx-2"
          variant={setColor(filter.is_suspicious)}
          title="Suspicious"
        >
          <Dropdown.Item
            onClick={() => suspicious(true)}
            className="bg-success"
          >
            true
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => suspicious(false)}
            className="bg-danger"
          >
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => suspicious(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          className="mx-2"
          variant={setColor(filter.is_private)}
          title="Private"
        >
          <Dropdown.Item
            onClick={() => privateRepo(true)}
            className="bg-success"
          >
            true
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => privateRepo(false)}
            className="bg-danger"
          >
            false
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => privateRepo(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
        <DropdownButton
          className="mx-2"
          variant={setColor(filter.review)}
          title="Review Status"
        >
          <Dropdown.Item
            onClick={() => review("suspicious auto")}
            className="bg-danger"
          >
            suspicious(auto)
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => review("suspicious manual")}
            className="bg-warning"
          >
            suspicious(manual)
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => review("approved")}
            className="bg-success"
          >
            approved
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => review("pending")}
            className="bg-primary"
          >
            pending
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => review("no action")}
            className="bg-secondary"
          >
            no action
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => review(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
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
