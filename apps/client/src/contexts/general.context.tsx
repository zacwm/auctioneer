import React from "react";

// Context value types.
interface GeneralContextInterface {
  tags: string[],
  setTags: (tags: string[]) => void,
}

// Original context state values.
const GeneralState: GeneralContextInterface = {
  tags: [],
  setTags: (tags: string[]) => {},
};

const Reducer = (state: any, action: any) => {
  if (action.type === 'reset') {
    return GeneralState;
  }

  const result = { ...state };
  result[action.type] = action.value;
  return result;
};

const GeneralContext: any = React.createContext<GeneralContextInterface | null>(GeneralState);

const GeneralProvider: any = (props: any) => {
  const [state, dispatch] = React.useReducer(Reducer, GeneralState);

  state.setTags = (tags: string[]) => {
    dispatch({ type: 'tags', value: tags });
  };
  
  return (
    <GeneralContext.Provider value={{ ...state }}>
      { props.children }
    </GeneralContext.Provider>
  );
};

const useGeneral = () => React.useContext<GeneralContextInterface>(GeneralContext);

export { GeneralProvider, useGeneral };