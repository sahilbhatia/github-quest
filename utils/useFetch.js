import { useState, useEffect } from "react";
export default function useFetch(url) {
  const [data, setData] = useState(null);
  async function callAPI(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setData(data);
    } catch (e) {
      return e;
    }
  }
  useEffect(() => {
    callAPI(url);
  }, [url]);
  return data;
}
