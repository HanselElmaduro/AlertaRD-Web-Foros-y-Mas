"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";
import { api } from "@/lib/api";
export type Data = Record<string, any>;
interface AppValue {
  state: Data | null;
  stats: Data | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  act: (path: string, data: unknown) => Promise<any>;
}
const AppContext = createContext<AppValue>({
  state: null,
  stats: null,
  loading: true,
  error: "",
  refresh: async () => {},
  act: async () => {},
});
export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Data | null>(null),
    [stats, setStats] = useState<Data | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const s = await api("state");
      setState(s);
      setStats(await api("results"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const i = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 15000);
    return () => clearInterval(i);
  }, [refresh]);
  const act = async (path: string, data: unknown) => {
    try {
      const r = await api(path, data);
      if (r.message) toast.success(r.message);
      await refresh();
      return r;
    } catch (e) {
      toast.error((e as Error).message);
      throw e;
    }
  };
  return (
    <AppContext.Provider value={{ state, stats, loading, error, refresh, act }}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);
export function useResource<T = any>(path: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      setData(await api<T>(path));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);
  return { data, error, loading, reload };
}
