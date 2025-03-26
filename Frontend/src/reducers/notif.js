const initialState = {
    count: 0,
  };
  
  export default function notificationReducer(state = initialState, action) {
    switch (action.type) {
      case 'FETCH_NOTIFICATION_COUNT_SUCCESS':
        return { ...state, count: action.payload };
      default:
        return state;
    }
  }