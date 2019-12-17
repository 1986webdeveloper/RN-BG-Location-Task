/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getLocations = `query GetLocations($id: ID!) {
  getLocations(id: $id) {
    id
    username
    location
  }
}
`;
export const listLocationss = `query ListLocationss(
  $filter: ModelLocationsFilterInput
  $limit: Int
  $nextToken: String
) {
  listLocationss(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      username
      location
    }
    nextToken
  }
}
`;
