import { v4 as uuid } from "uuid";
import { ModelManager } from "storverse-sao-model";
import { fetchDataId } from "./UserProfileService";
import { SaoConfig } from "./keplr";

export type Verse = {
  id?: never | string | undefined;
  createdAt: number;
  fileIds: string[];
  owner: string;
  price: string;
  digest: string;
  scope: number;
  status: number;
  nftTokenId: string;
  fileType: string;
};

export type VerseLike = {
  id?: never | string | undefined;
  createdAt: number;
  updatedAt: number;
  verseId: string;
  status: number;
  owner: string;
}

export type BookMark = {
  id?: never | string | undefined;
  verseIds: string[];
}

const VERSE_PREFIX = "verse_";
const VERSE_LIKE_PREFIX = "verse_like_"
const BOOKMARK_PREFIX = "bookmarkverse_"

export class VerseService {
  private modelManager: ModelManager;
  private config: SaoConfig;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.modelManager = modelManager;
    this.config = config;
  }

  GetVerse = async (id: string) => {
    var verse: Verse = await this.modelManager.loadModel(id);
    verse.id = id;

    console.log("loading verse: ", verse);

    return verse;
  };

  GetVerseDelegate = async (id: string) => {
    var verse: Verse = await this.modelManager.loadModelDelegate(id);
    verse.id = id;

    console.log("loading verse: ", verse);

    return verse;
  };

  GetVersesByOwner = async (
    owner: string, 
    userDataId?: string, 
    limit?: number, 
    offset?: number, 
    token?: string
  ): Promise<Verse[]> => {
    try {
      const verses: Verse[] = await fetchVersesByOwner(owner, userDataId, limit, offset, token, this.config.graphUrl);
      return verses;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching verses by owner');
    }
  };

  SaveVerse = async (verse: Verse): Promise<string> => {
    try {
      let dataId: string | PromiseLike<string>
      if (verse.id === undefined) {
        dataId = await this.modelManager.createModel({
          alias: VERSE_PREFIX + uuid(),
          data: verse,
        });
        verse.id = dataId;
        console.log("create verse with dataId", dataId);
        this.ShareDataModel(dataId, this.config.nodeDid);
      } else {
        dataId = verse.id
        verse.id = undefined
        await this.modelManager.updateModel({
          dataId: dataId,
          alias: VERSE_PREFIX + dataId,
          data: verse,
        });

        console.log("update verse..., ", verse);
      }

      return dataId;
    } catch (error) {
      // If any error occurs, handle it here
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving verse");
      }
    }
  };

  ShareDataModel = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids, sids);

    console.log("publish verse: ", id);
  };

  DeleteVerse = async (id: string) => {
    const verse: Verse = await this.GetVerse(id);
    verse.status = 2;
    await this.SaveVerse(verse);
    console.log("set verse status as 2: ", id);
  }

  GetVerseLike = async (id: string) => {
    var verseLike: VerseLike = await this.modelManager.loadModel(id);
    verseLike.id = id;

    console.log("loading verse like: ", verseLike);

    return verseLike;
  };

  GetVerseLikeByVerseId = async (verseId: string, did: string) => {
    const verseLikeDataId = await this.getVerseLikeDataId(did, verseId);
    if (verseLikeDataId) {
      return await this.GetVerseLike(verseLikeDataId);
    } else {
      return undefined;
    }
  };

  SaveVerseLike = async (verseLike: VerseLike, did: string): Promise<string> => {
    try {
      console.log("Create or update verse like status", verseLike);
      let dataId: string;

      try {
        // Check if the record exists
        dataId = await this.getVerseLikeDataId(did, verseLike.verseId);
      } catch (error) {
        console.error('Error fetching data ID:', error);
      }

      if (dataId) {
        // Update the existing record
        verseLike.id = undefined;
        await this.modelManager.updateModel({
          dataId: dataId,
          data: verseLike,
        });
        console.log("update verse like..., ", verseLike);
      } else {
        // Create a new record
        console.log("create verse like with verseLike", verseLike);
        dataId = await this.modelManager.createModel({
          alias: VERSE_LIKE_PREFIX + verseLike.verseId,
          data: verseLike,
        });
        console.log("create verse like with dataId", dataId);
        this.ShareVerseLike(dataId, this.config.nodeDid)
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving verse like");
      }
    }
  };

  getVerseLikeDataId = async (did: string, verseId: string): Promise<string> => {
    const modelKey = `${did}-${VERSE_LIKE_PREFIX}${verseId}-${this.config.platformId}:`;
    return fetchDataId(modelKey, this.config.api)
      .then((dataId) => {
        return dataId;
      })
      .catch((error) => {
        console.error('Error fetching data ID:', error);
        throw error;
      });
  };

  ShareVerseLike = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids, sids);

    console.log("publish verse like: ", id);
  };

  DeleteVerseLike = async (id: string, did: string) => {
    let dataId: string;
    try {
      // Check if the record exists
      dataId = await this.getVerseLikeDataId(did, id);
    } catch (error) {
      console.error('Error fetching data ID:', error);
    }

    const verseLike: VerseLike = await this.GetVerseLike(dataId);
    verseLike.status = 2;
    await this.SaveVerseLike(verseLike, did);
    console.log("set verse like status as 2: ", dataId);
  }

  // Get BookMark
  GetBookMark = async (did: string): Promise<BookMark> => {
    try {
      const dataId = await this.getBookMarkDataId(did);
      const bookMark: BookMark = await this.modelManager.loadModel(dataId);
      return bookMark;
    } catch (error) {
      throw new Error('BookMark not found');
    }
  };

  // Save BookMark
  SaveBookMark = async (bookMark: BookMark, did: string): Promise<string> => {
    try {
      console.log("Create or update BookMark status", bookMark);
      let dataId: string;

      try {
        // Check if the record exists
        dataId = await this.getBookMarkDataId(did);
      } catch (error) {
        console.error('Error fetching data ID:', error);
      }

      if (dataId) {
        // Update the existing record
        bookMark.id = undefined;
        await this.modelManager.updateModel({
          dataId: dataId,
          alias: BOOKMARK_PREFIX,
          data: bookMark,
        });

        console.log("update BookMark..., ", bookMark);
      } else {
        // Create a new record
        dataId = await this.modelManager.createModel({
          alias: BOOKMARK_PREFIX,
          data: bookMark,
        });

        console.log("Create BookMark with dataId", dataId);
      }

      return dataId;
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error saving BookMark");
      }
    }
  };

  // Get BookMark Data Id
  getBookMarkDataId = async (did: string): Promise<string> => {
    const modelKey = `${did}-${BOOKMARK_PREFIX}-${this.config.platformId}:`;
    return fetchDataId(modelKey, this.config.api)
      .then((dataId) => {
        return dataId;
      })
      .catch((error) => {
        throw error;
      });
  };

  // Add a verseId to the BookMark
  AddVerseIdToBookMark = async (verseId: string, did: string): Promise<void> => {
    try {
      let bookMark: BookMark;

      try {
        bookMark = await this.GetBookMark(did);
      } catch (error) {
        if (error.message === 'BookMark not found') {
          // Create a new BookMark object if it doesn't exist
          bookMark = { verseIds: [] };
        } else {
          throw error;
        }
      }

      const index = bookMark.verseIds.indexOf(verseId);
      if (index === -1) {
        // The verseId is not in the BookMark, add it at the beginning
        bookMark.verseIds.unshift(verseId);
        await this.SaveBookMark(bookMark, did);
      } else {
        console.log('The verseId is already in the BookMark, skipping.');
      }
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error adding verseId to BookMark");
      }
    }
  };

  // Remove a verseId from the BookMark
  RemoveVerseIdFromBookMark = async (verseId: string, did: string): Promise<void> => {
    try {
      let bookMark = await this.GetBookMark(did);

      if (bookMark.verseIds.includes(verseId)) {
        bookMark.verseIds = bookMark.verseIds.filter((id) => id !== verseId);
        await this.SaveBookMark(bookMark, did);
      } else {
        console.log('The verseId is not found in the BookMark, skipping.');
      }
    } catch (error) {
      console.error(error);
      if (error.message.includes('insuffcient coin')) {
        throw new Error('Insufficient coin balance for this operation.');
      } else {
        throw new Error("Error removing verseId from BookMark");
      }
    }
  };
}

const VERSE_FIELDS = `
  ID
  DataId
  CreatedAt
  FileIDs
  Owner
  Price
  Digest
  Scope
  Status
  NftTokenID
  FileType
`;

async function fetchVerses(query: string, dataPropertyName: string = 'verses', token?: string, graphUrl?: string): Promise<Verse[]> {
  const headers = {
    'Content-Type': 'application/json',
  };

  // If a token is provided, add it to the headers
  if (token) {
    headers['Authorization'] = `${token}`;
  }

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: {},
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  const rawVerses = result.data[dataPropertyName];

  const verses: Verse[] = rawVerses.map(parseVerse);

  return verses;
}


async function fetchVersesByOwner(owner: string, userDataId?: string, limit?: number, offset?: number, token?: string, graphUrl?: string): Promise<Verse[]> {
  const userDataIdCondition = userDataId ? `, userDataId: "${userDataId}"` : '';

  let limitOffsetCondition = '';
  if (limit !== undefined) {
    limitOffsetCondition += `, limit: ${limit}`;
  }
  if (offset !== undefined) {
    limitOffsetCondition += `, offset: ${offset}`;
  }

  const query = `
    {
      verses(owner: "${owner}"${userDataIdCondition}${limitOffsetCondition}) {
        ${VERSE_FIELDS}
      }
    }
  `;

  return await fetchVerses(query, 'verses', token, graphUrl);
}

function parseVerse(rawVerse: any): Verse {
  return {
    id: rawVerse.DataId,
    createdAt: parseInt(rawVerse.CreatedAt.n, 10),
    fileIds: JSON.parse(rawVerse.FileIDs),
    owner: rawVerse.Owner,
    price: rawVerse.Price,
    digest: rawVerse.Digest,
    scope: parseInt(rawVerse.Scope, 10),
    status: parseInt(rawVerse.Status, 10),
    nftTokenId: rawVerse.NftTokenID,
    fileType: rawVerse.FileType,
  };
}