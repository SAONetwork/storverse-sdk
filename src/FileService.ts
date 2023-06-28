import { v4 as uuidv4 } from "uuid";
import { ModelManager } from "storverse-sao-model";

export type FileInfo = {
  id: string;
  createdAt: number;
  fileDataId: string;
  contentType: string;
  owner: string;
  filename: string;
  fileCategory: string;
  extendInfo: string;
  thumbnailDataId: string;
  verseId: string;
};

export class FileService {
  private modelManager: ModelManager;

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
  }

  GetFileInfo = async (id: string) => {
    var fileInfo: FileInfo = await this.modelManager.loadModel(id);

    console.log("loading fileInfo: ", fileInfo);

    return fileInfo;
  };

  GetVerseFile = async (dataId: string, getFromFileInfo = true): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
    let fileDataId: string;
    let fileInfo: FileInfo | null = null;
  
    if (getFromFileInfo) {
      fileInfo = await this.modelManager.loadModel(dataId);
      fileDataId = fileInfo.fileDataId;
    } else {
      fileDataId = dataId;
    }
  
    let data: ArrayBuffer | null | string = null;
    return this.modelManager.loadModel(fileDataId)
      .then((content) => {
        if (content !== null) {
          console.log("loaded data model:", fileDataId);
        }
          data = decodeArrayBuffer(content as string);
        return { fileInfo, data };
      });
  };

  GetVerseFileDelegate = async (dataId: string, getFromFileInfo = true): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
    let fileDataId: string;
    let fileInfo: FileInfo | null = null;
  
    if (getFromFileInfo) {
      fileInfo = await this.modelManager.loadModelDelegate(dataId);
      fileDataId = fileInfo.fileDataId;
    } else {
      fileDataId = dataId;
    }
  
    let data: ArrayBuffer | null | string = null;
    return this.modelManager.loadModelDelegate(fileDataId)
      .then((content) => {
        if (content !== null) {
          console.log("loaded data model:", fileDataId);
        }
          data = decodeArrayBuffer(content as string);
        return { fileInfo, data };
      });
  };

  ShareFileInfo = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids);

    console.log("publish fileInfo: ", id);
  };
}

function decodeArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}