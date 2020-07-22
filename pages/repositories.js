import useSWR from 'swr';
import styled from "styled-components";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function Index() {
  const { data, error } = useSWR('/api/getPublicRepos', fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const Table = styled.table`
    widTH: 100%;
    Table-layout: fixed;
    border:1px solid black;
    background-color:#e5eaF5
  `;

  const TH = styled.th`
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    background-color: rgba(255, 255, 255, 0.3)
  `;

  console.log(data);
  return (
    <div>
      <center>
        <u><h1>Repositories</h1></u>
      </center>
      <Table>
        <tr>
          <TH>Name</TH>
          <TH>Description</TH>
          <TH>is_forked</TH>
          <TH>is_archived</TH>
          <TH>is_disabled</TH>
        </tr>
        {data.map((item) => (
          <tr style={{textAlign:"center"}} >
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>{item.is_forked ? <h3 style={{ color: "green" }}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
            <td>{item.is_archived ? <h3 style={{ color: "green" }}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
            <td>{item.is_disabled ? <h3 style={{ color: "green" }}> ✔</h3> : <p style={{ color: "brown" }}>✘</p>}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
