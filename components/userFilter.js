import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import moment from "moment";
export default function Index({ filter, setFilter }) {
  let [userName, setuserName] = useState(null);
  let userList = [];
  let userData = fetch(`/api/findUser/[findUser]?userName=${userName}`)
  let [githubHandle, setgithubHandle] = useState(null);
  let githubHandleList = [];
  let githubHandleData = fetch(`/api/findUser/[findUser]?githubHandle=${githubHandle}`)
  userData.then((response) => { return response.json() }).then((res) => {
    res.map((user) =>
      userList.push({
        value: user.name,
        label: user.name,
      })
    );
  })

  const filterOptionsUsers = (inputValue) => {
    return userList.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptionsUsers = (inputValue, callback) => {
    setuserName(inputValue)
    setTimeout(() => {
      callback(filterOptionsUsers(inputValue));
    }, 1000);
  };
  const setUser = (userName) => {
    let data = { ...filter };
    data.userName = userName.value;
    setFilter(data);
  };

  githubHandleData.then((response) => { return response.json() }).then((res) => {
    res.map((user) =>
    githubHandleList.push({
        value: user.github_handle,
        label: user.github_handle,
      })
    );
  })

  const filterOptionsGithubHandle = (inputValue) => {
    return githubHandleList.filter((i) =>
      i.label.includes(inputValue)
    );
  };

  const promiseOptionsGithubHandle = (inputValue, callback) => {
    setgithubHandle(inputValue)
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
        <Button className="ml-2" variant="dark" onClick={reset}>↺</Button>
      </div>
    </div>)
};
