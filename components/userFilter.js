import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import AsyncSelect from "react-select/async";
import DatePicker from "react-datepicker";
import { useState } from "react";
import moment from "moment";
export default function Index({ filter, setFilter }) {
  let [userName, setuserName] = useState(null);
  let userList = [];
  let userData = fetch(`/api/findUser/[findUser]?userName=${userName}`)

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
        <DatePicker
          onSelect={(e) => setDateFrom(e)}
         //selected={filter.startDate}
          maxDate={new Date()}
          placeholderText="Select search date from"
          className={`${filter.startDate != undefined ? "border-success" : ""} mx-1`}
        />
        <DatePicker
          onSelect={(e) => setDateTo(e)}
         // selected={filter.endDate}
          maxDate={new Date()}
          placeholderText="Select search date to"
          className={`${filter.endDate != undefined ? "border-success" : ""} mx-1`}
        />
        <Button className="ml-2" variant="dark" onClick={reset}>↺</Button>
      </div>
    </div>)
};
