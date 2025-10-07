import { createContext, useContext, useReducer, useMemo } from "react";

// Create context (this is like creating the "communication channel")
const DragDropContext = createContext();

// Define the reducer (this is the "state update logic")
const dragDropReducer = (state, action) => {
  switch (action.type) {
    case "DRAG_START":
      return {
        ...state,
        isDragging: true,
        draggedItem: action.payload.item,
        draggedType: action.payload.type,
      };
    case "DRAG_OVER":
      return {
        ...state,
        currentDropTarget: action.payload.target,
        dropPosition: action.payload.position,
      };
    case "DRAG_END":
      return {
        ...state,
        isDragging: false,
        draggedItem: null,
        currentDropTarget: null,
      };
    default:
      return state;
  }
};

// Define the initial state
const initialState = {
  isDragging: false,
  draggedItem: null,
  draggedType: null,
  currentDropTarget: null,
  dropPosition: null,
};

// This is the key connection - The Provider Component
export const DragDropProvider = ({ children }) => {
  // Here's where the magic happens! useReducer connects our reducer function
  // to React's state management system
  const [state, dispatch] = useReducer(dragDropReducer, initialState);

  // Both the current state and the dispatch function are packaged into context value
  // This is crucial - components need BOTH pieces to participate in the state system
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  // The Provider makes both state and dispatch available to all child components
  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

// A custom hook to make consuming the context easier and safer
export const useDragDropContext = () => {
  const context = useContext(DragDropContext);

  // This error handling ensures developers can't accidentally use the context
  // outside of a provider - this prevents mysterious bugs
  if (!context) {
    throw new Error(
      "useDragDropContext must be used within a DragDropProvider"
    );
  }

  return context;
};
