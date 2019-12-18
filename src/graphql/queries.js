/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getLocation = `query GetLocation($id: ID!) {
  getLocation(id: $id) {
    id
    username
    location
  }
}
`;
export const listLocations = `query ListLocations(
  $filter: ModelLocationFilterInput
  $limit: Int
  $nextToken: String
) {
  listLocations(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      username
      location
    }
    nextToken
  }
}
`;
