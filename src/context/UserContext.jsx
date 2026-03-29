import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getAdminUser, fetchAdminProfile } from "../utils/auth";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(getAdminUser);

  useEffect(() => {
    fetchAdminProfile()
      .then((profile) => setUser(profile))
      .catch(() => {});
  }, []);

  const refreshUser = useCallback((updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    } else {
      const stored = getAdminUser();
      setUser(stored);
    }
  }, []);

  const value = useMemo(
    () => ({ user, refreshUser }),
    [user, refreshUser]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with UserProvider
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    return { user: getAdminUser(), refreshUser: () => {} };
  }
  return ctx;
}
