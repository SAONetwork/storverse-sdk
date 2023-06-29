import { ModelManager } from "storverse-sao-model";
import { UserProfileService, UserProfile } from "./UserProfileService";
import { SaoConfig, getConnectedWallet } from "./keplr";
import { Verse, VerseService } from "./VerseService";
import { FileService, FileInfo } from "./FileService";
import { VerseComment, VerseCommentService } from "./VerseCommentService";
import { FollowingsResult, UserFollowing, UserFollowingService } from "./UserFollowingService";

export class StorverseService {
  public userProfileService: UserProfileService;
  public verseService: VerseService;
  public fileService: FileService;
  public verseCommentService: VerseCommentService;
  public userFollowingService: UserFollowingService;
  public config: SaoConfig;
  public modelManager: ModelManager;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.userProfileService = new UserProfileService(modelManager, config);
    this.verseService = new VerseService(modelManager, config);
    this.fileService = new FileService(modelManager, config);
    this.verseCommentService = new VerseCommentService(modelManager, config);
    this.userFollowingService = new UserFollowingService(modelManager, config);
    this.config = config;
    this.modelManager = modelManager;
  }

  ShareDataModel = async (id: string) => {
    await this.modelManager.updateModelPermission(id, this.config.nodeDid);
    console.log("publish profile: ", id);
  };

  GetUserProfile = async (did: string): Promise<UserProfile> => {
    const connectedWallet = getConnectedWallet();
    if (connectedWallet.sid === did) {
      return this.userProfileService.GetUserProfile(did);
    } else {
      return this.userProfileService.GetUserProfileDelegate(did);
    }
  };

  GetUserProfileDelegate = async (did: string): Promise<UserProfile> => {
    return this.userProfileService.GetUserProfileDelegate(did);
  };

  GetAvatar = async (id: string): Promise<any> => {
    return this.userProfileService.GetAvatar(id);
  };

  GetAvatarDelegate = async (id: string): Promise<any> => {
    return this.userProfileService.GetAvatarDelegate(id);
  };

  SaveUserProfile = async (profile: UserProfile): Promise<string> => {
    return this.userProfileService.SaveUserProfile(profile);
  };

  SaveUserAvatar = async (profileId: string, avatar: string): Promise<void> => {
    return this.userProfileService.SaveUserAvatar(profileId, avatar);
  };

  SaveUserBanner = async (profileId: string, banner: string): Promise<void> => {
    return this.userProfileService.SaveUserBanner(profileId, banner);
  };

  ShareUserProfile = async (): Promise<void> => {
    const connectedWallet = getConnectedWallet();
    var profile = await this.userProfileService.GetUserProfile(connectedWallet.sid, false);
    await this.userProfileService.ShareDataModel(profile.id);
    if (profile.avatar) {
      await this.userProfileService.ShareDataModel(profile.avatar);
    }
  }

  GetVerse = async (id: string): Promise<Verse> => {
    return this.verseService.GetVerse(id);
  };

  GetVerseDelegate = async (id: string): Promise<Verse> => {
    return this.verseService.GetVerseDelegate(id);
  };

  GetVersesByOwner = async (
    owner: string,
    userDataId?: string,
    limit?: number,
    offset?: number
  ): Promise<Verse[]> => {
    const connectedWallet = getConnectedWallet();
    return this.verseService.GetVersesByOwner(owner, userDataId, limit, offset, connectedWallet.token);
  };

  ShareVerse = async (id: string): Promise<void> => {
    const verse = await this.verseService.GetVerse(id);
    await this.verseService.ShareDataModel(id, this.config.nodeDid);
    
    if (verse.fileIds && Array.isArray(verse.fileIds)) {
      for (const fileId of verse.fileIds) {
        await this.verseService.ShareDataModel(fileId, this.config.nodeDid);
      }
    }
  };

  SaveVerse = async (verse: Verse): Promise<string> => {
    return this.verseService.SaveVerse(verse);
  }

  CreateFile = async (file: File): Promise<string> => {
    return this.fileService.CreateFile(file);
  };

  GetFile = async (id: string): Promise<ArrayBuffer | null | string> => {
    let result = await this.fileService.GetFile(id, false);
    return result.data;
  };

  GetFileDelegate = async (id: string): Promise<ArrayBuffer | null | string> => {
    let result = await this.fileService.GetFileDelegate(id, false);
    return result.data;
  };

  GetVerseFile = async (
    dataId: string,
    getFromFileInfo = true
  ): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
    return this.fileService.GetFile(dataId, getFromFileInfo);
  };

  GetVerseFileDelegate = async (
    dataId: string,
    getFromFileInfo = true
  ): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
    return this.fileService.GetFileDelegate(dataId, getFromFileInfo);
  };

  GetVerseComment = async (id: string): Promise<VerseComment> => {
    return this.verseCommentService.GetVerseComment(id);
  }

  GetVerseCommentDelegate = async (id: string): Promise<VerseComment> => {
    return this.verseCommentService.GetVerseCommentDelegate(id);
  }

  GetVerseCommentsByVerseId = async (verseId: string, userDataId?: string, limit?: number, offset?: number): Promise<VerseComment[]> => {
    const connectedWallet = getConnectedWallet();
    return this.verseCommentService.GetVerseCommentsByVerseId(verseId, userDataId, limit, offset, connectedWallet.token);
  }

  GetUserFollowing = async (did: string, targetId:string): Promise<UserFollowing> => {
    return this.userFollowingService.GetUserFollowing(did, targetId);
  }

  GetUserFollowingDelegate = async (did: string, targetId:string): Promise<UserFollowing> => {
    return this.userFollowingService.GetUserFollowingDelegate(did, targetId);
  }

  GetUserFollowers = async (followingDataId: string, mutualWithId?: string, userDataId?: string, limit?: number, offset?: number,): Promise<FollowingsResult> => {
    const connectedWallet = getConnectedWallet();
    return this.userFollowingService.GetUserFollowers(followingDataId, mutualWithId, userDataId, limit, offset, connectedWallet.token);
  }

  GetUserFollowedList = async (followerDataId: string, isExpired?: boolean, userDataId?: string, limit?: number, offset?: number,): Promise<FollowingsResult> => {
    const connectedWallet = getConnectedWallet();
    return this.userFollowingService.GetUserFollowedList(followerDataId, isExpired, userDataId, limit, offset, connectedWallet.token);
  }

}
