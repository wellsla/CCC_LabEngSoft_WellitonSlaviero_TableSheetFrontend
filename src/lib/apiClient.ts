// This file now acts as a switchboard. It re-exports from the mock client.
// To switch back to a real API, you would change this file to re-export
// from a 'realApiClient.ts' or implement the API calls directly here.
export * from './mockApiClient';
