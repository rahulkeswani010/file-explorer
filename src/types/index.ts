export interface FileItem {
  type: 'file';
  name: string;
  meta: string;
}

export interface FolderItem {
  type: 'folder';
  name: string;
  data: (FileItem | FolderItem)[];
}

export type ExplorerItem = FileItem | FolderItem; 