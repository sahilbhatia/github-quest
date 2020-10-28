import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 150px;
`;

export default function Index({ filter, setFilter, minDate, userId }) {
  let [repositoryName, setRepositoryName] = useState(null);
  let repositoryList = [];
  let reposData = fetch(
    `/api/find-repository?userId=${userId}&repositoryName=${repositoryName}`
  );
  let startDate,
    endDate,
    reviewDate,
    repoName,
    isForked,
    isArchived,
    isDisabled,
    isSuspicious,
    reviewStatus,
    sourceType,
    errorDetails;
  if (filter) {
    if (filter.startDate) startDate = new Date(filter.startDate);
    if (filter.endDate) endDate = new Date(filter.endDate);
    if (filter.reviewDate) reviewDate = new Date(filter.reviewDate);
    isForked = filter.is_forked;
    isArchived = filter.is_archived;
    isDisabled = filter.is_disabled;
    isSuspicious = filter.is_suspicious;
    reviewStatus = filter.review;
    sourceType = filter.source_type;
    errorDetails = filter.error_details;
    repoName = filter.repoName;
  }
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
  const review = (value) => {
    let data = { ...filter };
    data.review = value;
    setFilter(data);
  };
  const source_type = (value) => {
    let data = { ...filter };
    data.source_type = value;
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
      case "bitbucket":
        return "primary";
      case "gitlab":
        return "warning";
      case "github":
        return "success";
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
        <DatePicker
          onSelect={setDateReview}
          selected={reviewDate}
          maxDate={new Date()}
          minDate={new Date(minDate)}
          placeholderText="Select reviewed date"
          className="mx-1"
        />
      </div>
      <div className="d-flex">
        <Wrapper>
          <AsyncSelect
            loadOptions={promiseOptionsRepos}
            name="select repository"
            placeholder="repository..."
            defaultInputValue={repoName}
            onChange={setRepoName}
            className="w-100"
          />
        </Wrapper>
        <DropdownButton
          className="ml-2"
          variant={setColor(isForked)}
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
          variant={setColor(isArchived)}
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
          variant={setColor(isDisabled)}
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
          variant={setColor(isSuspicious)}
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
          variant={setColor(reviewStatus)}
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
          variant={setColor(sourceType)}
          title="Source Type"
        >
          <Dropdown.Item
            onClick={() => source_type("gitlab")}
            className="bg-warning"
          >
            gitlab
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => source_type("github")}
            className="bg-success"
          >
            github
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => source_type("bitbucket")}
            className="bg-primary"
          >
            bitbucket
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => source_type(undefined)}
            className="bg-dark text-white"
          >
            all
          </Dropdown.Item>
        </DropdownButton>
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
  minDate: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
};
