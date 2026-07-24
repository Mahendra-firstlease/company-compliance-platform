export interface document {
  docName: string;
  fileName: string;
  fileType: string;
  fileSize: string;
}
export type ApplicationCase = {
  id: string;
  query: string;
  queryText: string;
  assignedExecutiveId: string;
  documents: document[];
};
