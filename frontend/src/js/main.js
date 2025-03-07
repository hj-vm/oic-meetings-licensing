// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// API helpers
const API_URL = '/api';

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };
  
  const response = await fetch(`${API_URL}/${endpoint}`, mergedOptions);
  
  if (!response.ok) {
    console.error('API Error:', response.statusText);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
  
  return await response.json();
}

// Format helpers
function formatDay(dateStr) {
  return new Date(dateStr).getDate();
}

function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleString('en-GB', { month: 'short' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function formatNoticeType(type) {
  const types = {
    'alcohol': 'Alcohol',
    'civic': 'Civic',
    'taxi': 'Taxi',
    'entertainment': 'Entertainment',
    'gambling': 'Gambling',
    'late-hours': 'Late Hours',
    'other': 'Other'
  };
  return types[type] || type;
}

// Recent Meetings component
window.recentMeetingsApp = function() {
  return {
    meetings: [],
    loading: true,
    
    async init() {
      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch meetings from today onwards, sorted by date
        const response = await fetchAPI('committee-meetings', {
          params: {
            sort: 'date',
            'filters[date][$gte]': today,
            pagination: {
              page: 1,
              pageSize: 3
            }
          }
        });
        
        this.meetings = response.data || [];
      } catch (error) {
        console.error('Error fetching recent meetings:', error);
        this.meetings = [];
      } finally {
        this.loading = false;
      }
    },
    
    formatDay,
    formatMonth,
    formatDate
  };
};

// Recent Notices component
window.recentNoticesApp = function() {
  return {
    notices: [],
    loading: true,
    
    async init() {
      try {
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch current notices (not expired)
        const response = await fetchAPI('licensing-notices', {
          params: {
            sort: 'publication_date:desc',
            'filters[expiry_date][$gte]': today,
            pagination: {
              page: 1,
              pageSize: 3
            }
          }
        });
        
        this.notices = response.data || [];
      } catch (error) {
        console.error('Error fetching recent notices:', error);
        this.notices = [];
      } finally {
        this.loading = false;
      }
    },
    
    formatDate,
    formatNoticeType
  };
};
