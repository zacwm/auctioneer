import React from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";

// Context value types.
interface SocketContextInterface {
  socket: Socket | undefined;
}

// Original context state values.
const SocketState: SocketContextInterface = {
  socket: undefined,
};

const Reducer = (state: any, action: any) => {
  if (action.type === 'reset') {
    return SocketState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const SocketContext: any = React.createContext<SocketContextInterface | null>(SocketState);

const SocketProvider: any = (props: any) => {
  const [state, dispatch] = React.useReducer(Reducer, SocketState);

  // On mount, set the socket.
  React.useEffect((): any => {
    const newSocket = io();
    dispatch({ type: 'socket', value: newSocket });

    return () => newSocket.close();
  }, []);
  
  return (
    <SocketContext.Provider value={{ ...state }}>
      { props.children }
    </SocketContext.Provider>
  );
};

const useSocket = () => React.useContext<SocketContextInterface>(SocketContext);

export { SocketProvider, useSocket };