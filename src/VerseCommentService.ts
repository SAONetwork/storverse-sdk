import { v4 as uuid } from "uuid";
import { ModelManager } from "storverse-sao-model";
import { fetchDataId } from "./UserProfileService";
import { SaoConfig } from "./keplr";

export type VerseComment = {
  id?: never | string | undefined;
  createdAt: number;
  updatedAt: number;
  comment: string;
  parentId: string;
  parent: VerseComment | null;
  verseId: string;
  owner: string;
  status: number;
}

export type VerseCommentLike = {
  id?: never | string | undefined;
  createdAt: number;
  updatedAt: number;
  commentId: string;
  status: number;
  owner: string;
}

const VERSE_COMMENT_PREFIX = "verse_comment_";
const VERSE_COMMENTS_LIKE_PREFIX = "verse_comment_like_";

export class VerseCommentService {
  private modelManager: ModelManager;
  private config: SaoConfig;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.modelManager = modelManager;
    this.config = config;
  }

  GetVerseComment = async (id: string) => {
    var verseComment: VerseComment = await this.modelManager.loadModel(id);
    verseComment.id = id;

    console.log("loading verseComment: ", verseComment);

    return verseComment;
  };

  GetVerseCommentDelegate = async (id: string) => {
    var verseComment: VerseComment = await this.modelManager.loadModelDelegate(id);
    verseComment.id = id;

    console.log("loading verseComment: ", verseComment);

    return verseComment;
  };

  GetVerseCommentsByVerseId = async (verseId: string, userDataId?: string, limit?: number, offset?: number, token?: string): Promise<VerseComment[]> => {
    try {
      const verseComments: VerseComment[] = await fetchVerseComments(verseId, limit, offset, userDataId, token, this.config.graphUrl);
      return verseComments;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching verseComments by verseId');
    }
  };

  SaveVerseComment = async (verseComment: VerseComment): Promise<string> => {
    try {
      let dataId: string | PromiseLike<string>;
      if (verseComment.id === undefined) {
        console.log("create verseComment with verseComment", verseComment);
        dataId = await this.modelManager.createModel({
          alias: VERSE_COMMENT_PREFIX + uuid(),
          data: verseComment,
        });
        console.log("create verseComment with dataId", dataId);
        console.log("publish verseComment", dataId);
        this.ShareVerseComment(dataId, this.config.nodeDid);
      } else {
        try {
          dataId = verseComment.id;
          verseComment.id = undefined;
          await this.modelManager.updateModel({
            dataId: dataId,
            alias: VERSE_COMMENT_PREFIX + dataId,
            data: verseComment,
          });
        } catch (e) {
          console.error(e);
          throw new Error("some error happens, wait for a while please...");
        }

        console.log("update verseComment..., ", verseComment);
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving verse comment");
      }
    }
  };

  ShareVerseComment = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids);

    console.log("publish verseComment: ", id);
  };

  DeleteVerseComment = async (id: string) => {
    const verseComment: VerseComment = await this.GetVerseComment(id);
    verseComment.status = 2;
    await this.SaveVerseComment(verseComment);
    console.log("set verse comment status as 2: ", id);
  };

  GetVerseCommentLike = async (id: string) => {
    const verseCommentsLike: VerseCommentLike = await this.modelManager.loadModel(id);
    verseCommentsLike.id = id;

    console.log("loading verseCommentsLike: ", verseCommentsLike);

    return verseCommentsLike;
  };

  SaveVerseCommentLike = async (verseCommentsLike: VerseCommentLike, did: string): Promise<string> => {
    try {
      console.log("Create or update verse comment like status", verseCommentsLike);
      let dataId: string;

      try {
        // Check if the record exists
        dataId = await this.getVerseCommentLikeDataId(did, verseCommentsLike.commentId);
      } catch (error) {
        console.error('Error fetching data ID:', error);
      }

      if (dataId) {
        // Update the existing record
        verseCommentsLike.id = undefined;
        await this.modelManager.updateModel({
          dataId: dataId,
          data: verseCommentsLike,
        });
        console.log("update verseCommentsLike..., ", verseCommentsLike);
      } else {
        // Create a new record
        console.log("create verseCommentsLike with verseCommentsLike", verseCommentsLike);
        dataId = await this.modelManager.createModel({
          alias: VERSE_COMMENTS_LIKE_PREFIX + verseCommentsLike.commentId,
          data: verseCommentsLike,
        });
        console.log("create verseCommentsLike with dataId", dataId);
        this.ShareVerseCommentLike(dataId, this.config.nodeDid)
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving verse comment like");
      }
    }
  };

  getVerseCommentLikeDataId = async (did: string, commentId: string): Promise<string> => {
    const modelKey = `${did}-${VERSE_COMMENTS_LIKE_PREFIX}${commentId}-${this.config.platformId}:`;
    return fetchDataId(modelKey, this.config.api)
      .then((dataId) => {
        return dataId;
      })
      .catch((error) => {
        console.error('Error fetching data ID:', error);
        throw error;
      });
  };

  ShareVerseCommentLike = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids);

    console.log("publish verseCommentsLike: ", id);
  };

  DeleteVerseCommentLike = async (id: string, did: string) => {
    let dataId: string;
    try {
      // Check if the record exists
      dataId = await this.getVerseCommentLikeDataId(did, id);
    } catch (error) {
      console.error('Error fetching data ID:', error);
    }

    const verseCommentLike: VerseCommentLike = await this.GetVerseCommentLike(dataId);
    verseCommentLike.status = 2;
    await this.SaveVerseCommentLike(verseCommentLike, did);
    console.log("set verse comment like status as 2: ", dataId);
  };
}

async function fetchVerseComments(
  verseID: string,
  limit?: number,
  offset?: number,
  userDataId?: string, 
  token?: string,
  graphUrl?: string,
): Promise<VerseComment[]> {
  const query = `
    query GetVerseComments($verseID: String!, $limit: Int, $offset: Int, $userDataId: String) {
      verseComments(verseID: $verseID, limit: $limit, offset: $offset, userDataId: $userDataId) {
        ID
        DataId
        CreatedAt
        UpdatedAt
        VerseID
        Owner
        Status
        Comment
        Parent {
          ID
          DataId
          CreatedAt
          UpdatedAt
          VerseID
          Owner
          Status
          Comment
          LikeCount
          HasLiked
          OwnerEthAddr
          OwnerAvatar
          OwnerUsername
          OwnerBio
        }
        LikeCount
        HasLiked
        OwnerEthAddr
        OwnerAvatar
        OwnerUsername
        OwnerBio
      }
    }
  `;

  const headers = {
    'Content-Type': 'application/json',
  };

  // If a token is provided, add it to the headers
  if (token) {
    headers['Authorization'] = `${token}`;
  }

  const response = await fetch(graphUrl , {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: {
        verseID: verseID,
        limit: limit,
        offset: offset,
        userDataId: userDataId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  const rawVerseComments = result.data.verseComments;

  const verseComments: VerseComment[] = rawVerseComments.map(parseVerseComment);

  return verseComments;
}

function parseVerseComment(rawVerseComment: any): VerseComment {
  return {
    id: rawVerseComment.DataId,
    createdAt: parseInt(rawVerseComment.CreatedAt.n, 10),
    updatedAt: parseInt(rawVerseComment.UpdatedAt.n, 10),
    verseId: rawVerseComment.VerseID,
    owner: rawVerseComment.Owner,
    status: rawVerseComment.Status,
    comment: rawVerseComment.Comment,
    parentId: '',
    parent: rawVerseComment.Parent ? parseVerseComment(rawVerseComment.Parent) : null,
  };
}