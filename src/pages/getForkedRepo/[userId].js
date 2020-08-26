import { useRouter } from 'next/router'
import React from "react";
import useSWR from 'swr';
import ErrorComponent from "../components/errorpage"
import LoadingComponent from "../components/loaderpage";
import ForkedRepoComponent from "../components/ForkedRepoComponent"
let code;
const fetcher = (url) => fetch(url).then((res) =>{code=res.status; return res.json()})

export default function Post() {
  const router = useRouter()
  const { userId } = router.query;
  let { data, error } = useSWR(`/api/getForkedRepo?id=${userId}`, fetcher);
  if (error || code==400 || code==404 || code==500) return <ErrorComponent code={code}/>
  if (!data) return <LoadingComponent/>

  return (<ForkedRepoComponent data={data}/>)
};
