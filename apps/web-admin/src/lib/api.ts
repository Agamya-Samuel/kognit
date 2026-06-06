import { getApiClient, type ApiClient } from '@edutech/api-client';

// Create a proxy that lazily gets the API client
const api = new Proxy({} as ApiClient, {
  get(_, prop) {
    // Lazy initialization - get the client when a method is actually accessed
    const client = getApiClient();
    return client[prop as keyof ApiClient];
  }
});

export default api;