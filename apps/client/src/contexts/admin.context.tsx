import React from "react";
import axios from "axios";

// Context value types.
interface AdminContextInterface {
  listings: string[],
  setListings: (listings: any[]) => void,
  getListings: () => void,
  fetchingListings: boolean,
  fetchListingError: string | null,
}

// Original context state values.
const AdminState: AdminContextInterface = {
  listings: [],
  setListings: (listings: any[]) => {},
  getListings: () => {},
  fetchingListings: false,
  fetchListingError: null,
};

const Reducer = (state: any, action: any) => {
  if (action.type === 'reset') {
    return AdminState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const AdminContext: any = React.createContext<AdminContextInterface | null>(AdminState);

const AdminProvider: any = (props: any) => {
  const [state, dispatch] = React.useReducer(Reducer, AdminState);

  state.setListings = (listings: any[]) => {
    dispatch({ type: 'listings', value: listings });
  };

  state.getListings = () => {
    dispatch({ type: 'fetchingListings', value: true });
    axios.get("/api/admin/listings")
      .then((res) => {
        if (res.data.success) {
          dispatch({ type: 'listings', value: res.data.listings });
        } else {
          dispatch({ type: 'fetchListingError', value: 'Failed to load listings' });
        }
      })
      .catch((e) => {
        console.warn(e);
        dispatch({ type: 'fetchListingError', value: 'Failed to load listings' });
      })
      .finally(() => {
        dispatch({ type: 'fetchingListings', value: false });
      });
  };

  // On first page render, fetch listings, and then every 10 seconds after that.
  React.useEffect(() => {
    state.getListings();

    const interval = setInterval(() => {
      state.getListings();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <AdminContext.Provider value={{ ...state }}>
      { props.children }
    </AdminContext.Provider>
  );
};

const useAdmin = () => React.useContext<AdminContextInterface>(AdminContext);

export { AdminProvider, useAdmin };