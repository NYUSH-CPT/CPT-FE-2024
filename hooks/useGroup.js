import { useState, useEffect } from 'react';
import { requester } from '@/utils';

export function useGroup() {
  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedGroup = localStorage.getItem("group");
    if (storedGroup) {
      setGroup(storedGroup);
      setIsLoading(false);
    } else {
      requester.get("/info")
        .then(res => {
          setGroup(res.data.group);
          localStorage.setItem("group", res.data.group);
        })
        .catch(err => console.error("Error fetching group info:", err))
        .finally(() => setIsLoading(false));
    }
  }, []);

  return { group, isLoading };
}