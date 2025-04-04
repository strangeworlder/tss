import { gql } from '@apollo/client';

export const GET_COMMENTS = gql`
  query GetComments($parentId: ID!, $parentType: String!) {
    getComments(parentId: $parentId, parentType: $parentType) {
      id
      title
      content
      author {
        name
        avatar
      }
      parentId
      parentType
      createdAt
      updatedAt
      replies {
        id
        title
        content
        author {
          name
          avatar
        }
        createdAt
        updatedAt
        replyCount
      }
      replyCount
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      success
      message
      data {
        id
        title
        content
        author {
          name
          avatar
        }
        parentId
        parentType
        createdAt
        updatedAt
        replies {
          id
          title
          content
          author {
            name
            avatar
          }
          createdAt
          updatedAt
          replyCount
        }
        replyCount
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      success
      message
    }
  }
`; 