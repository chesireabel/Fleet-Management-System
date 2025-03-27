const initialState = {
  theme: localStorage.getItem('theme') || 'light', // Get from localStorage or default to 'light'
};

export default function themeReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload); // Persist theme
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}
