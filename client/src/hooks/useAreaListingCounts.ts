import { useEffect, useState } from 'react';
import { ACTIVE_AREAS } from '../data/mockData';
import { properties as propertiesApi } from '../services/api';

type AreaCounts = Record<string, number>;

const initialCounts = Object.fromEntries(ACTIVE_AREAS.map(area => [area.name, 0]));

export function useAreaListingCounts() {
  const [counts, setCounts] = useState<AreaCounts>(initialCounts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    propertiesApi.areaCounts()
      .then(res => {
        if (!cancelled) {
          setCounts({ ...initialCounts, ...res.data });
        }
      })
      .catch(() => {
        if (!cancelled) setCounts(initialCounts);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { counts, loading };
}
