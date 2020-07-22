import useSWR from 'swr';
import styled from "styled-components";
import { Table } from "react-bootstrap"
const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSWR('/api/getPublicRepos', fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const TH = styled.th`
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
  `;

  console.log(data);
  return (
    <div>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"></link>
      <center>
        <u><h1>Repositories</h1></u>
      </center>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <TH>Name</TH>
            <TH>Description</TH>
            <TH>forked</TH>
            <TH>archived</TH>
            <TH>disabled</TH>
          </tr>
        </thead>
        <tbody>
        {data.map((item) => (
          <tr >
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>{item.is_forked ? <h3 style={{ color: "green",marginTop:"-5px"}}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
            <td>{item.is_archived ? <h3 style={{ color: "green" }}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
            <td>{item.is_disabled ? <h3 style={{ color: "green" }}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
          </tr>
        ))}
        </tbody>
      </Table>
    </div>
  )
}
