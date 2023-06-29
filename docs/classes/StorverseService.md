[Storverse Typescript SDK](../README.md) / StorverseService

# Class: StorverseService

## Table of contents

### Constructors

- [constructor](StorverseService.md#constructor)

### Properties

- [config](StorverseService.md#config)
- [fileService](StorverseService.md#fileservice)
- [modelManager](StorverseService.md#modelmanager)
- [userFollowingService](StorverseService.md#userfollowingservice)
- [userProfileService](StorverseService.md#userprofileservice)
- [verseCommentService](StorverseService.md#versecommentservice)
- [verseService](StorverseService.md#verseservice)

### Methods

- [CreateFile](StorverseService.md#createfile)
- [GetAvatar](StorverseService.md#getavatar)
- [GetAvatarDelegate](StorverseService.md#getavatardelegate)
- [GetFile](StorverseService.md#getfile)
- [GetFileDelegate](StorverseService.md#getfiledelegate)
- [GetUserFollowedList](StorverseService.md#getuserfollowedlist)
- [GetUserFollowers](StorverseService.md#getuserfollowers)
- [GetUserFollowing](StorverseService.md#getuserfollowing)
- [GetUserFollowingDelegate](StorverseService.md#getuserfollowingdelegate)
- [GetUserProfile](StorverseService.md#getuserprofile)
- [GetUserProfileDelegate](StorverseService.md#getuserprofiledelegate)
- [GetVerse](StorverseService.md#getverse)
- [GetVerseComment](StorverseService.md#getversecomment)
- [GetVerseCommentDelegate](StorverseService.md#getversecommentdelegate)
- [GetVerseCommentsByVerseId](StorverseService.md#getversecommentsbyverseid)
- [GetVerseDelegate](StorverseService.md#getversedelegate)
- [GetVerseFile](StorverseService.md#getversefile)
- [GetVerseFileDelegate](StorverseService.md#getversefiledelegate)
- [GetVersesByOwner](StorverseService.md#getversesbyowner)
- [SaveUserAvatar](StorverseService.md#saveuseravatar)
- [SaveUserBanner](StorverseService.md#saveuserbanner)
- [SaveUserProfile](StorverseService.md#saveuserprofile)
- [SaveVerse](StorverseService.md#saveverse)
- [ShareDataModel](StorverseService.md#sharedatamodel)
- [ShareUserProfile](StorverseService.md#shareuserprofile)
- [ShareVerse](StorverseService.md#shareverse)

## Constructors

### constructor

• **new StorverseService**(`modelManager`, `config`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `modelManager` | `ModelManager` |
| `config` | [`SaoConfig`](SaoConfig.md) |

## Properties

### config

• **config**: [`SaoConfig`](SaoConfig.md)

___

### fileService

• **fileService**: `FileService`

___

### modelManager

• **modelManager**: `ModelManager`

___

### userFollowingService

• **userFollowingService**: `UserFollowingService`

___

### userProfileService

• **userProfileService**: `UserProfileService`

___

### verseCommentService

• **verseCommentService**: `VerseCommentService`

___

### verseService

• **verseService**: `VerseService`

## Methods

### CreateFile

▸ **CreateFile**(`file`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `file` | `File` |

#### Returns

`Promise`<`string`\>

___

### GetAvatar

▸ **GetAvatar**(`id`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`any`\>

___

### GetAvatarDelegate

▸ **GetAvatarDelegate**(`id`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`any`\>

___

### GetFile

▸ **GetFile**(`id`): `Promise`<`string` \| `ArrayBuffer`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`string` \| `ArrayBuffer`\>

___

### GetFileDelegate

▸ **GetFileDelegate**(`id`): `Promise`<`string` \| `ArrayBuffer`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`string` \| `ArrayBuffer`\>

___

### GetUserFollowedList

▸ **GetUserFollowedList**(`followerDataId`, `isExpired?`, `userDataId?`, `limit?`, `offset?`): `Promise`<`FollowingsResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `followerDataId` | `string` |
| `isExpired?` | `boolean` |
| `userDataId?` | `string` |
| `limit?` | `number` |
| `offset?` | `number` |

#### Returns

`Promise`<`FollowingsResult`\>

___

### GetUserFollowers

▸ **GetUserFollowers**(`followingDataId`, `mutualWithId?`, `userDataId?`, `limit?`, `offset?`): `Promise`<`FollowingsResult`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `followingDataId` | `string` |
| `mutualWithId?` | `string` |
| `userDataId?` | `string` |
| `limit?` | `number` |
| `offset?` | `number` |

#### Returns

`Promise`<`FollowingsResult`\>

___

### GetUserFollowing

▸ **GetUserFollowing**(`did`, `targetId`): `Promise`<`UserFollowing`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `targetId` | `string` |

#### Returns

`Promise`<`UserFollowing`\>

___

### GetUserFollowingDelegate

▸ **GetUserFollowingDelegate**(`did`, `targetId`): `Promise`<`UserFollowing`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `targetId` | `string` |

#### Returns

`Promise`<`UserFollowing`\>

___

### GetUserProfile

▸ **GetUserProfile**(`did`): `Promise`<`UserProfile`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`UserProfile`\>

___

### GetUserProfileDelegate

▸ **GetUserProfileDelegate**(`did`): `Promise`<`UserProfile`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`UserProfile`\>

___

### GetVerse

▸ **GetVerse**(`id`): `Promise`<`Verse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`Verse`\>

___

### GetVerseComment

▸ **GetVerseComment**(`id`): `Promise`<`VerseComment`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`VerseComment`\>

___

### GetVerseCommentDelegate

▸ **GetVerseCommentDelegate**(`id`): `Promise`<`VerseComment`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`VerseComment`\>

___

### GetVerseCommentsByVerseId

▸ **GetVerseCommentsByVerseId**(`verseId`, `userDataId?`, `limit?`, `offset?`): `Promise`<`VerseComment`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `verseId` | `string` |
| `userDataId?` | `string` |
| `limit?` | `number` |
| `offset?` | `number` |

#### Returns

`Promise`<`VerseComment`[]\>

___

### GetVerseDelegate

▸ **GetVerseDelegate**(`id`): `Promise`<`Verse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`Verse`\>

___

### GetVerseFile

▸ **GetVerseFile**(`dataId`, `getFromFileInfo?`): `Promise`<{ `data`: `string` \| `ArrayBuffer` ; `fileInfo`: `FileInfo`  }\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dataId` | `string` | `undefined` |
| `getFromFileInfo` | `boolean` | `true` |

#### Returns

`Promise`<{ `data`: `string` \| `ArrayBuffer` ; `fileInfo`: `FileInfo`  }\>

___

### GetVerseFileDelegate

▸ **GetVerseFileDelegate**(`dataId`, `getFromFileInfo?`): `Promise`<{ `data`: `string` \| `ArrayBuffer` ; `fileInfo`: `FileInfo`  }\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `dataId` | `string` | `undefined` |
| `getFromFileInfo` | `boolean` | `true` |

#### Returns

`Promise`<{ `data`: `string` \| `ArrayBuffer` ; `fileInfo`: `FileInfo`  }\>

___

### GetVersesByOwner

▸ **GetVersesByOwner**(`owner`, `userDataId?`, `limit?`, `offset?`): `Promise`<`Verse`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `owner` | `string` |
| `userDataId?` | `string` |
| `limit?` | `number` |
| `offset?` | `number` |

#### Returns

`Promise`<`Verse`[]\>

___

### SaveUserAvatar

▸ **SaveUserAvatar**(`profileId`, `avatar`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `profileId` | `string` |
| `avatar` | `string` |

#### Returns

`Promise`<`void`\>

___

### SaveUserBanner

▸ **SaveUserBanner**(`profileId`, `banner`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `profileId` | `string` |
| `banner` | `string` |

#### Returns

`Promise`<`void`\>

___

### SaveUserProfile

▸ **SaveUserProfile**(`profile`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `profile` | `UserProfile` |

#### Returns

`Promise`<`string`\>

___

### SaveVerse

▸ **SaveVerse**(`verse`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `verse` | `Verse` |

#### Returns

`Promise`<`string`\>

___

### ShareDataModel

▸ **ShareDataModel**(`id`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`void`\>

___

### ShareUserProfile

▸ **ShareUserProfile**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### ShareVerse

▸ **ShareVerse**(`id`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`Promise`<`void`\>
