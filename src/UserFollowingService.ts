import { v4 as uuid } from "uuid";
import { ModelManager } from "storverse-sao-model";
import { UserProfile, fetchDataId } from "./UserProfileService";
import { SaoConfig } from "./keplr";

export type UserFollowing = {
  id?: never | string | undefined;
  createdAt: number
  updatedAt: number
  expiredAt: number
  follower: string
  following: string
  status: number
}

export type FollowingsResult = {
  followings: UserFollowing[];
  count: number;
};

const MODEL_NAME_PREFIX = "user_following_";

export class UserFollowingService {
  private modelManager: ModelManager;
  private config: SaoConfig;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.modelManager = modelManager;
    this.config = config;
  }

  GetUserFollowing = async (did: string, targetId:string) => {
    let dataId: string;
    try {
      // Check if the record exists
      dataId = await this.getUserFollowingDataId(did, targetId);
    } catch (error) {
      console.error('Error fetching data ID:', error);
    }

    var userFollowing: UserFollowing = await this.modelManager.loadModel(dataId);
    userFollowing.id = dataId;

    console.log("loading userFollowing: ", userFollowing);

    return userFollowing;
  };

  GetUserFollowingDelegate = async (did: string, targetId:string) => {
    let dataId: string;
    try {
      // Check if the record exists
      dataId = await this.getUserFollowingDataId(did, targetId);
    } catch (error) {
      console.error('Error fetching data ID:', error);
    }

    var userFollowing: UserFollowing = await this.modelManager.loadModelDelegate(dataId);
    userFollowing.id = dataId;

    console.log("loading userFollowing: ", userFollowing);

    return userFollowing;
  };

  GetUserFollowers = async (followingDataId: string, mutualWithId?: string, userDataId?: string, limit?: number, offset?: number, token?: string): Promise<FollowingsResult> => {
    try {
      const followingsResult: FollowingsResult = await fetchFollowings(followingDataId, mutualWithId, limit, offset, userDataId, token, this.config.graphUrl);
      return followingsResult;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching user followers');
    }
  };

  GetUserFollowedList = async (follower: string, isExpired?: boolean, userDataId?: string, limit?: number, offset?: number, token?: string): Promise<FollowingsResult> => {
    try {
      const followedResult: FollowingsResult = await fetchFollowedList(follower, isExpired, limit, offset, userDataId, token, this.config.graphUrl);
      return followedResult;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching followed list');
    }
  };

  SaveUserFollowing = async (userFollowing: UserFollowing, did: string): Promise<string> => {
    try {
      console.log("Create or update userFollowing status", userFollowing);
      let dataId: string;

      try {
        // Check if the record exists
        dataId = await this.getUserFollowingDataId(did, userFollowing.following);
      } catch (error) {
        console.error('Error fetching data ID:', error);
      }

      if (dataId) {
        // Update the existing record
        userFollowing.id = undefined;
        await this.modelManager.updateModel({
          dataId: dataId,
          data: userFollowing,
        });
        console.log("update userFollowing..., ", userFollowing);
      } else {
        // Create a new record
        console.log("create userFollowing with userFollowing", userFollowing);
        dataId = await this.modelManager.createModel({
          alias: MODEL_NAME_PREFIX + userFollowing.following,
          data: userFollowing,
        });
        console.log("create userFollowing with dataId", dataId);
        console.log("user following", userFollowing.following);
        console.log("user follower", userFollowing.follower);
        this.ShareUserFollowing(dataId, this.config.nodeDid)
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving following");
      }
    }
  };

  getUserFollowingDataId = async (did: string, following: string): Promise<string> => {
    const modelKey = `${did}-${MODEL_NAME_PREFIX}${following}-${this.config.platformId}:`;
    return fetchDataId(modelKey, this.config.api)
      .then((dataId) => {
        return dataId;
      })
      .catch((error) => {
        console.error('Error fetching data ID:', error);
        throw error;
      });
  };

  ShareUserFollowing = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids);

    console.log("publish userFollowing: ", id);
  };

  DeleteUserFollowing = async (targetId: string, did: string) => {
    const userFollowing: UserFollowing = await this.GetUserFollowing(did, targetId);
    userFollowing.status = 2;
    await this.SaveUserFollowing(userFollowing, did);
    console.log("set userFollowing status as 2: ", userFollowing.id);
  };
}


async function fetchFollowings(followingDataId: string, mutualWithId?: string, limit: number = 10, offset: number = 0, userDataId?: string, token?: string, graphUrl?: string): Promise<FollowingsResult> {
  const query = `
    {
      followings(followingDataId: "${followingDataId}", ${mutualWithId ? `mutualWithId: "${mutualWithId}",` : ''} limit: ${limit}, offset: ${offset}, ${userDataId ? `userDataId: "${userDataId}",` : ''}) {
        followings {
          ID
          DataId
          CreatedAt
          UpdatedAt
          ExpiredAt
          Follower
          Following
          Status
        }
        count
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

  return fetch(graphUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: {},
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      return parseFollowingsResult(result, false);
    });
}

async function fetchFollowedList(follower: string, isExpired: boolean = false, limit: number = 10, offset: number = 0, userDataId?: string, token?: string, graphUrl?: string): Promise<FollowingsResult> {
  const query = `
    {
      followedList(follower: "${follower}", isExpired: ${isExpired}, limit: ${limit}, offset: ${offset}, ${userDataId ? `userDataId: "${userDataId}",` : ''}) {
        followings {
          ID
          DataId
          CreatedAt
          UpdatedAt
          ExpiredAt
          Follower
          Following
          Status
        }
        count
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

  return fetch(graphUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: {},
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((result) => {
      return parseFollowingsResult(result, true);
    });
}


function parseFollowingsResult(response: any, isFollowedList: boolean = false): FollowingsResult {
  const dataField = isFollowedList ? "followedList" : "followings";
  const rawFollowings = response.data[dataField].followings;
  const count = response.data[dataField].count;

  const followings: UserFollowing[] = rawFollowings.map((rawFollowing: any) => {
    return {
      id: rawFollowing.ID,
      createdAt: parseInt(rawFollowing.CreatedAt.n, 10),
      updatedAt: parseInt(rawFollowing.UpdatedAt.n, 10),
      expiredAt: parseInt(rawFollowing.ExpiredAt.n, 10),
      follower: rawFollowing.Follower,
      following: rawFollowing.Following,
      status: parseInt(rawFollowing.Status, 10),
    };
  });

  return {
    followings,
    count,
  };
}
