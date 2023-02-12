import React from "react";
import axios from "axios";

// Context value types.
interface UserContextInterface {
  accesstoken: string | null;
  user: any;
  subscriptions: any;
  notifications: any;
  bids: any;
  setToken: (token: string | undefined) => void;
  fetch: () => void;
  setUser: (user: any) => void;
  setSubscriptions: (subscriptions: [string] | []) => void;
  setNotifications: (notifications: any[] | []) => void;
  setBids: (bids: any[] | []) => void;
  logout: () => void;
}

// Original context state values.
const UserState: UserContextInterface = {
  accesstoken: null,
  user: undefined,
  subscriptions: [],
  notifications: [],
  bids: [],
  setToken: (token: string | undefined | null) => {},
  fetch: () => {},
  setUser: (user: any) => {},
  setSubscriptions: (subscriptions: string[] | []) => {},
  setNotifications: (notifications: any[] | []) => {},
  setBids: (bids: any[] | []) => {},
  logout: () => {},
};

const Reducer = (state: any, action: any) => {
  if (action.type === 'reset') {
    return UserState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const UserContext: any = React.createContext<UserContextInterface | null>(UserState);

const UserProvider: any = (props: any) => {
  const [state, dispatch] = React.useReducer(Reducer, UserState);

  React.useEffect((): any => {
    // On Mount, Check via the API if there is an existing session.
    axios.get("/api/auth")
      .then((res) => {
        if (res.status === 200) {
          dispatch({ type: 'accesstoken', value: res.data.accesstoken });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  state.setToken = (token: string) => {
    dispatch({ type: 'accesstoken', value: token });
  }

  state.fetch = () => {
    axios.get("/api/auth")
      .then((res) => {
        if (res.status === 200) {
          dispatch({ type: 'accesstoken', value: res.data.accesstoken });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  state.setUser = (user: any) => {
    dispatch({ type: 'user', value: user });
  }

  state.setSubscriptions = (subscriptions: [string] | []) => {
    dispatch({ type: 'subscriptions', value: subscriptions });
  }

  state.setNotifications = (notifications: any[] | []) => {
    dispatch({ type: 'notifications', value: notifications });
  }

  state.setBids = (bids: any[] | []) => {
    dispatch({ type: 'bids', value: bids });
  }

  state.logout = () => {
    axios.get("/api/auth/logout")
      .then((res) => {
        if (res.status === 200) {
          dispatch({ type: 'accesstoken', value: null });
          dispatch({ type: 'user', value: undefined });
          dispatch({ type: 'subscriptions', value: [] });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  
  return (
    <UserContext.Provider value={{ ...state }}>
      { props.children }
    </UserContext.Provider>
  );
};

const useUser = () => React.useContext<UserContextInterface>(UserContext);

export { UserProvider, useUser };