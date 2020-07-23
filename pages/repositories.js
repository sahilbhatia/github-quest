import useSWR from 'swr';
import styled from "styled-components";
import { useState } from "react";
import { Table, Button } from "react-bootstrap";
const fetcher = (url) => fetch(url).then((res) => res.json());
let limit = 5;

export default function Index() {

  let [offset, setOffset] = useState(0);
  let { data, error } = useSWR(`/api/getPublicRepos?limit=${limit}&offset=${offset}`, fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  console.log(data);
  const TH = styled.th`
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    text-align:center;
  `;
  const Wrapper = styled.div`
    border:1px solid black;
    height: 100vh; 
    overflow: hidden;
  `;
  const Pagination = styled.div`
  width:100%;
`;
  const prev = () => {
    offset = offset <= 0 ? 0 : offset - limit;
    setOffset(offset);
  }
  const next = async () => {
    offset += limit;
    setOffset(offset);
  }
  return (
    <Wrapper className="bg-light grey">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"></link>
      <div className="text-center ">
        <u><h1><b>Repositories</b></h1></u>
      </div>
      <Table hover className="text-center" size="sm">
        <thead className="bg-info text-white" >
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
          {data.map((item, Index) => (
            <tr >
              <td>{Index + 1}</td>
              <td className="text-left"><b><a href={item.url} className="text-primary">{item.name}</a></b></td>
              <td>{item.description == null ? item.description : "No description provided"}</td>
              <td>{item.is_forked ? <h3 className="text-success"> ✔</h3> : <p className="text-danger">✘</p>}</td>
              <td>{item.is_archived ? <h3 className="text-success"> ✔</h3> : <p className="text-danger">✘</p>}</td>
              <td>{item.is_disabled ? <h3 className="text-success"> ✔</h3> : <p className="text-danger">✘</p>}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination className="d-flex justify-content-end">
        <Button onClick={prev} className="bg-white text-dark">{offset == 0 ? <span className="text-muted">&laquo;</span> : <span>&laquo; {`${offset - 5} - ${offset}`}</span>}</Button>
        <Button onClick={next} className="mx-5 bg-white text-dark">{`${limit} - ${limit + 5}`} &raquo;</Button>
      </Pagination>
    </Wrapper>
  )
}
