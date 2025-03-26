export const fetchNotificationCount = () => async (dispatch) => {
    try {
      const response = await fetch('http://localhost:3000/api/incident-reports'); // Modify with your API endpoint
      const data = await response.json();
  
      if (response.ok) {
        const notificationCount = data.notifications.length; // Or any condition to count unread reports
        dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: notificationCount });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  