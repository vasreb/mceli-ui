import { useCallback, useMemo } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

type FilterHookResult<T extends string> = {
  filter: Partial<Record<T, string>>;
  setFilterField: (key: T, value: string) => void;
};

const parseFiltersFromSearch = <T extends string>(
  search: unknown
): Partial<Record<T, string>> => {
  const result: Partial<Record<T, string>> = {};
  if (!search || typeof search !== 'object') return result;

  for (const [key, value] of Object.entries(search as Record<string, unknown>)) {
    if (!key.startsWith('filter.')) continue;

    const parsedKey = key.slice('filter.'.length) as T;
    if (value == null) continue;

    const str = typeof value === 'string' ? value : String(value);
    if (str.trim()) result[parsedKey] = str;
  }

  return result;
};

export const useFilterParams = <T extends string>(
  initialFilter?: Partial<Record<T, string>>
): FilterHookResult<T> => {
  const routerState = useRouterState();
  const navigate = useNavigate();

  const pathname = routerState.location.pathname;
  const searchObj = routerState.location.search;

  const filter = useMemo(() => {
    const fromUrl = parseFiltersFromSearch<T>(searchObj);
    return Object.keys(fromUrl).length ? fromUrl : (initialFilter ?? {});
  }, [searchObj, initialFilter]);

  const setFilterField = useCallback(
    (key: T, value: string) => {
      const trimmed = value.trim();
      const paramKey = `filter.${key}`;

      navigate(
        {
          to: pathname,
          // ВАЖНО: search как апдейтер, а не строка
          search: (prev: any) => {
            const prevObj = (prev ?? {}) as Record<string, unknown>;
            const prevVal = prevObj[paramKey];

            // ничего не меняем -> не навигейтить
            if (trimmed) {
              if (prevVal === trimmed) return prev;
              return { ...prevObj, [paramKey]: trimmed };
            } else {
              if (!(paramKey in prevObj)) return prev;
              const next = { ...prevObj };
              delete next[paramKey];
              return next;
            }
          },
          replace: true,
        } as any // иначе TS будет ругаться из-за неизвестной схемы search
      );
    },
    [navigate, pathname]
  );

  return { filter, setFilterField };
};
