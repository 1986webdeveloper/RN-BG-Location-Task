/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getLocation = `query GetLocation($id: ID!, $createdAt: AWSDateTime!) {
  getLocation(id: $id, createdAt: $createdAt) {
    id
    username
    location
    createdAt
  }
}
`;
export const listLocations = `query ListLocations(
  $id: ID
  $createdAt: ModelStringKeyConditionInput
  $filter: ModelLocationFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listLocations(
    id: $id
    createdAt: $createdAt
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      id
      username
      location
      createdAt
    }
    nextToken
  }
}
`;
