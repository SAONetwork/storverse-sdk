import { v4 as uuidv4 } from "uuid";
import { ModelManager } from "storverse-sao-model";
import { SaoConfig } from "./keplr";

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

const FILE_MODEL_NAME_PREFIX = "filecontent_";

export class FileService {
  private modelManager: ModelManager;
  private config: SaoConfig;

  constructor(modelManager: ModelManager, config: SaoConfig) {
    this.modelManager = modelManager;
    this.config = config;
  }

  GetFileInfo = async (id: string) => {
    var fileInfo: FileInfo = await this.modelManager.loadModel(id);

    console.log("loading fileInfo: ", fileInfo);

    return fileInfo;
  };

  GetFile = async (dataId: string, getFromFileInfo = true): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
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

  GetFileDelegate = async (dataId: string, getFromFileInfo = true): Promise<{ fileInfo: FileInfo; data: ArrayBuffer | null | string }> => {
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

  CreateFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = async event => {
        try {
          // Check if the result is an ArrayBuffer, and if not, throw an error.
          if (!(event.target.result instanceof ArrayBuffer)) {
            throw new Error("Expected an ArrayBuffer from FileReader");
          }
          // try to upload the file chunk and get the result
          const content = encodeArrayBuffer(event.target.result);
          const dataId = await this.modelManager.createModel({
            alias: FILE_MODEL_NAME_PREFIX + uuidv4(),
            data: content,
          });

          this.ShareFileInfo(dataId, this.config.nodeDid);
          resolve(dataId);
        } catch (error) {
          // if there is an error, reject the promise with the error
          if (error.message.includes('insuffcient coin')) {
            reject(new Error('Insufficient coin balance for this operation.'));
          } else {
            reject(error);
          }
        }
      };
    });
  }

  ShareFileInfo = async (id: string, sids: string[]) => {
    await this.modelManager.updateModelPermission(id, sids);

    console.log("publish fileInfo: ", id);
  };
}

function encodeArrayBuffer (buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
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