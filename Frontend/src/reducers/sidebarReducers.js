const initialState = {
    sidebarShow: true,
  };
  
  export default function sidebarReducer(state = initialState, action) {
    switch (action.type) {
      case 'SET_SIDEBAR':
        return { ...state, sidebarShow: action.payload };
         case 'TOGGLE_SIDEBAR_UNFOLDABLE':
      return { ...state, sidebarUnfoldable: !state.sidebarUnfoldable }; 

      default:
        return state;
    }
  }