// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// API helpers
const API_URL = '/api';

async function fetchAPI(endpoint, params = {}) {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  // Handle pagination
  if (params.page) {
    queryParams.append('pagination[page]', params.page);
  }
  if (params.pageSize) {
    queryParams.append('pagination[pageSize]', params.pageSize);
  }
  
  // Handle sorting
  if (params.sort) {
    if (Array.isArray(params.sort)) {
      params.sort.forEach((sort, index) => {
        queryParams.append(`sort[${index}]`, sort);
      });
    } else {
      queryParams.append('sort[0]', params.sort);
    }
  }
  
  // Handle filtering
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(`filters[${key}]`, value);
      }
    });
  }
  
  // Handle population
  if (params.populate) {
    if (Array.isArray(params.populate)) {
      params.populate.forEach(item => {
        queryParams.append('populate', item);
      });
    } else {
      queryParams.append('populate', params.populate);
    }
  }
  
  const url = `${API_URL}/${endpoint}?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('API Error:', response.statusText);
      return { data: [], meta: { pagination: { total: 0, pageCount: 1 } } };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { data: [], meta: { pagination: { total: 0, pageCount: 1 } } };
  }
}

// Format helpers
function formatDay(dateStr) {
  return new Date(dateStr).getDate();
}

function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleString('en-GB', { month: 'short' });
}

function formatYear(dateStr) {
  return new Date(dateStr).getFullYear();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getMediaUrl(media) {
  if (!media || !media.data) return '';
  
  return media.data.attributes.url.startsWith('/')
    ? `${window.location.origin}${media.data.attributes.url}`
    : media.data.attributes.url;
}

// Meetings app
window.meetingsApp = function() {
  return {
    meetings: [],
    loading: true,
    page: 1,
    pageSize: 10,
    totalItems: 0,
    pageCount: 1,
    filters: {
      committeeType: '',
      dateFrom: '',
      dateTo: '',
      searchQuery: ''
    },
    
    async init() {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('committee')) {
        this.filters.committeeType = urlParams.get('committee');
      }
      if (urlParams.has('from')) {
        this.filters.dateFrom = urlParams.get('from');
      }
      if (urlParams.has('to')) {
        this.filters.dateTo = urlParams.get('to');
      }
      if (urlParams.has('search')) {
        this.filters.searchQuery = urlParams.get('search');
      }
      if (urlParams.has('page')) {
        this.page = parseInt(urlParams.get('page')) || 1;
      }
      
      // Check for specific meeting ID
      if (urlParams.has('id')) {
        const meetingId = urlParams.get('id');
        await this.fetchSingleMeeting(meetingId);
      } else {
        await this.fetchMeetings();
      }
    },
    
    async fetchMeetings() {
      this.loading = true;
      
      try {
        const apiParams = {
          page: this.page,
          pageSize: this.pageSize,
          sort: ['date:desc'],
          populate: ['agenda', 'minutes', 'meeting_papers']
        };
        
        // Add filters
        if (this.filters.committeeType) {
          apiParams.filters = apiParams.filters || {};
          apiParams.filters['committee_type'] = this.filters.committeeType;
        }
        
        if (this.filters.dateFrom) {
          apiParams.filters = apiParams.filters || {};
          apiParams.filters['date'][$gte] = this.filters.dateFrom;
        }
        
        if (this.filters.dateTo) {
          apiParams.filters = apiParams.filters || {};
          apiParams.filters['date'][$lte] = this.filters.dateTo;
        }
        
        if (this.filters.searchQuery) {
          apiParams.filters = apiParams.filters || {};
          apiParams.filters['title'][$containsi] = this.filters.searchQuery;
        }
        
        const response = await fetchAPI('committee-meetings', apiParams);
        
        this.meetings = response.data || [];
        this.totalItems = response.meta.pagination.total;
        this.pageCount = response.meta.pagination.pageCount;
      } catch (error) {
        console.error('Error fetching meetings:', error);
        this.meetings = [];
        this.totalItems = 0;
        this.pageCount = 1;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSingleMeeting(id) {
      this.loading = true;
      
      try {
        const response = await fetchAPI(`committee-meetings/${id}`, {
          populate: ['agenda', 'minutes', 'meeting_papers']
        });
        
        if (response.data) {
          this.meetings = [response.data];
          this.totalItems = 1;
          this.pageCount = 1;
        } else {
          this.meetings = [];
          this.totalItems = 0;
          this.pageCount = 1;
        }
      } catch (error) {
        console.error(`Error fetching meeting with ID ${id}:`, error);
        this.meetings = [];
        this.totalItems = 0;
        this.pageCount = 1;
      } finally {
        this.loading = false;
      }
    },
    
    async applyFilters() {
      this.page = 1;
      await this.fetchMeetings();
      this.updateUrlParams();
    },
    
    async resetFilters() {
      this.filters = {
        committeeType: '',
        dateFrom: '',
        dateTo: '',
        searchQuery: ''
      };
      this.page = 1;
      await this.fetchMeetings();
      this.updateUrlParams();
    },
    
    async nextPage() {
      if (this.page < this.pageCount) {
        this.page++;
        await this.fetchMeetings();
        this.updateUrlParams();
        window.scrollTo(0, 0);
      }
    },
    
    async prevPage() {
      if (this.page > 1) {
        this.page--;
        await this.fetchMeetings();
        this.updateUrlParams();
        window.scrollTo(0, 0);
      }
    },
    
    updateUrlParams() {
      const params = new URLSearchParams();
      
      if (this.filters.committeeType) {
        params.set('committee', this.filters.committeeType);
      }
      if (this.filters.dateFrom) {
        params.set('from', this.filters.dateFrom);
      }
      if (this.filters.dateTo) {
        params.set('to', this.filters.dateTo);
      }
      if (this.filters.searchQuery) {
        params.set('search', this.filters.searchQuery);
      }
      if (this.page > 1) {
        params.set('page', this.page);
      }
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.pushState({}, '', newUrl);
    },
    
    formatDay,
    formatMonth,
    formatYear,
    formatDate,
    getMediaUrl
  };
};
