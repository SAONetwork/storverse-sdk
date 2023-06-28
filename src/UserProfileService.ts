import { v4 as uuidv4 } from "uuid";
import { ModelManager } from "storverse-sao-model";
import { SaoConfig } from "./keplr";

export type UserProfile = {
  id?: never | string | undefined;
  createdAt: number
  updatedAt: number
  did: string
  ethAddr: string
  avatar: string
  avatarContent: string
  username: string
  twitter: string
  youtube: string
  bio: string
  banner: string
}

export class UserProfileService {
  private modelManager: ModelManager;
  private config: SaoConfig;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.modelManager = modelManager;
    this.config = config;
  }

  GetUserProfile = async (did: string, getAvatar = true): Promise<UserProfile> => {
    return this.getDataId(did)
      .then((dataId) => {
        return this.modelManager.loadModel(dataId)
          .then((profile: UserProfile) => {
            profile.id = dataId;
            profile.username = decodeURIComponent(profile.username);
            profile.bio = decodeURIComponent(profile.bio);
            profile.twitter = decodeURIComponent(profile.twitter);
            profile.youtube = decodeURIComponent(profile.youtube);
            if (getAvatar && profile.avatar) {
              return this.GetAvatar(profile.avatar)
                .then((avatar) => {
                  profile.avatarContent = avatar;
                  return profile;
                })
                .catch((error) => {
                  console.error('Error fetching avatar:', error);
                  return profile;
                });
            } else {
              return profile;
            }
          });
      })
      .catch(() => {
        throw new Error('dataId:user_profile not found');
      });
  };

  GetUserProfileDelegate = async (did: string): Promise<UserProfile> => {
    return this.getDataId(did)
      .then((dataId) => {
        return this.modelManager.loadModelDelegate(dataId)
          .then((profile: UserProfile) => {
            profile.id = dataId;
            profile.username = decodeURIComponent(profile.username);
            profile.bio = decodeURIComponent(profile.bio);
            profile.twitter = decodeURIComponent(profile.twitter);
            profile.youtube = decodeURIComponent(profile.youtube);
            if (profile.avatar) {
              return this.GetAvatarDelegate(profile.avatar)
                .then((avatar) => {
                  profile.avatarContent = avatar;
                  return profile;
                })
                .catch((error) => {
                  console.error('Error fetching avatar:', error);
                  return profile;
                });
            } else {
              return profile;
            }
          });
      })
      .catch(() => {
        throw new Error('dataId:user_profile not found');
      });
  };

  getDataId = async (did: string): Promise<string> => {
    const modelKey = `${did}-user_profile-${this.config.platformId}:`;
    return fetchDataId(modelKey, this.config.api)
      .then((dataId) => {
        return dataId;
      })
      .catch((error) => {
        console.error('Error fetching data ID:', error);
        throw error;
      });
  };

  GetAvatar = async (id: string): Promise<string> => {
    return this.modelManager.loadModel(id)
        .then((content) => {
          if (content !== null) {
            console.log("loaded data model:", id);
          }
          return content as string;
        });
  };

  GetAvatarDelegate = async (id: string): Promise<string> => {
    return this.modelManager.loadModelDelegate(id)
        .then((content) => {
          if (content !== null) {
            console.log("loaded data model:", id);
          }
          return content as string;
        });
  };

  SaveUserProfile = async (profile: UserProfile): Promise<string> => {
    console.log(profile)
    try {
      let dataId: string | PromiseLike<string>
      if (profile.id === undefined) {
        dataId = await this.modelManager.createModel(
          {
            alias: "user_profile",
            data: profile,
          });
        profile.id = dataId;
        console.log("create profile with dataId", dataId);
        this.ShareDataModel(dataId);
      } else {
        dataId = profile.id
        profile.id = undefined
        await this.modelManager.updateModel({
          dataId: dataId,
          alias: "user_profile",
          data: profile,
        });

        console.log("update profile..., ", profile);
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving user profile");
      }
    }
  };

  SaveUserAvatar = async (profileId: string, avatar: string) => {
    const profile = await this.GetUserProfile(profileId);
    const dataId = await this.modelManager.createModel({
      alias: "filecontent_" + uuidv4(),
      data: avatar,
    });
    console.log("create avatar with dataId", dataId);
    profile.avatar = dataId;
    this.ShareDataModel(dataId);
    await this.SaveUserProfile(profile);
  }

  SaveUserBanner = async (profileId: string, banner: string) => {
    const profile = await this.GetUserProfile(profileId);
    const dataId = await this.modelManager.createModel({
      alias: "filecontent_" + uuidv4(),
      data: banner,
    });
    console.log("create banner with dataId", dataId);
    this.ShareDataModel(dataId);
    profile.banner = dataId;
    await this.SaveUserProfile(profile);
  }

  ShareDataModel = async (id: string) => {
    await this.modelManager.updateModelPermission(id, this.config.nodeDid);
    console.log("publish profile: ", id);
  };
}

export async function fetchDataId(key: string, restApiEndpoint: string): Promise<string> {
  const url = `${restApiEndpoint}/SaoNetwork/sao/model/model/${key}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log(result)
  return result.model.data;
}