import { useState, useEffect } from "react";
import axios from "axios";

const useFetch = (url, options = {}, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [url, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
