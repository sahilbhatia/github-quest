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
    text-align:center;
  `;
  
  const Wrapper = styled.div`
    border:1px solid black; 
  `;
  return (
    <Wrapper >
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"></link>
      <div className="text-center ">
        <u><h1><b>Repositories</b></h1></u>
        </div>
      <Table  hover className="text-center">
        <thead className="bg-primary" >
          <tr>
            <TH>Sr.No</TH>
            <TH>Name</TH>
            <TH>Description</TH>
            <TH>Forked</TH>
            <TH>Archived</TH>
            <TH>Disabled</TH>
          </tr>
        </thead>
        <tbody>
        {data.map((item,Index) => (
          <tr >
            <td>{Index+1}</td>
            <td className="text-left"><b><a href={item.url}>{item.name}</a></b></td>
            <td>{item.description==null?item.description:"No description provided"}</td>
            <td>{item.is_forked ? <h3 className="text-success" style={{ marginTop:"-5px" }}> ✔</h3> : <p className="text-danger">✘</p>}</td>
            <td>{item.is_archived ? <h3 className="text-success" style={{ marginTop:"-5px" }}> ✔</h3> : <p className="text-danger">✘</p>}</td>
            <td>{item.is_disabled ? <h3 className="text-success" style={{ marginTop:"-5px" }}> ✔</h3> : <p className="text-danger">✘</p>}</td>
          </tr>
        ))}
        </tbody>
      </Table>
    </Wrapper>
  )
}

