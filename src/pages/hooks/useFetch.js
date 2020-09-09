import { useState, useEffect } from "react";
import moment from "moment";
import ROUTES from "../routes/constantRoutes";
export default function useFetch(url, id) {
  const [data, setData] = useState(null);
  async function callAPI(url, id) {
    try {
      const response = await fetch(
        `${ROUTES[url]}?id=${id}&updatedAt=${moment().toISOString()}`
      );
      const data = await response.json();
      setData(data);
    } catch (e) {
      return e;
    }
  }
  useEffect(() => {
    callAPI(url, id);
  }, [url]);
  return data;
}
