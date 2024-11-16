import React, { useState, useEffect, KeyboardEvent } from 'react';
import { ExplorerItem, FileItem } from '../types';
import './FileExplorer.css';

interface FileExplorerProps {
  data: ExplorerItem;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  item: FileItem | null;
}

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
  </svg>
);

const FolderIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d={isOpen 
      ? "M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"
      : "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
    }/>
  </svg>
);

export const FileExplorer: React.FC<FileExplorerProps> = ({ data }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });
  const [focusedItem, setFocusedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu') && !target.closest('.file')) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (name: string) => {
    setSelectedFile(name);
    setFocusedItem(name);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleFileAction = (action: 'copy' | 'delete' | 'rename') => {
    if (contextMenu.item) {
      const fileName = contextMenu.item.name;
      switch (action) {
        case 'copy':
          console.log(`Copy action triggered for file: ${fileName}`);
          break;
        case 'delete':
          console.log(`Delete action triggered for file: ${fileName}`);
          break;
        case 'rename':
          console.log(`Rename action triggered for file: ${fileName}`);
          break;
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, item: ExplorerItem, path: string) => {
    switch (e.key) {
      case 'Enter':
        if (item.type === 'folder') {
          toggleFolder(path);
        } else {
          handleFileClick(item.name);
        }
        break;
      case ' ':
        e.preventDefault();
        if (item.type === 'file') {
          handleFileClick(item.name);
        }
        break;
      case 'ContextMenu':
        e.preventDefault();
        if (item.type === 'file') {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          handleContextMenu(
            { clientX: rect.left, clientY: rect.bottom, preventDefault: () => {} } as React.MouseEvent,
            item as FileItem
          );
        }
        break;
    }
  };

  const renderItem = (item: ExplorerItem, path: string = '') => {
    const currentPath = `${path}/${item.name}`;
    const isExpanded = expandedFolders.has(currentPath);

    if (item.type === 'file') {
      return (
        <div
          key={currentPath}
          className={`file ${selectedFile === item.name ? 'selected' : ''} ${focusedItem === item.name ? 'focused' : ''}`}
          onClick={() => handleFileClick(item.name)}
          onContextMenu={(e) => handleContextMenu(e, item)}
          onKeyDown={(e) => handleKeyDown(e, item, currentPath)}
          tabIndex={0}
          role="treeitem"
          aria-selected={selectedFile === item.name}
        >
          <FileIcon />
          {item.name}
        </div>
      );
    }

    return (
      <div key={currentPath} className="folder">
        <div
          className={`folder-name ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleFolder(currentPath)}
          onKeyDown={(e) => handleKeyDown(e, item, currentPath)}
          tabIndex={0}
          role="button"
          aria-expanded={isExpanded}
        >
          <FolderIcon isOpen={isExpanded} />
          {item.name}
        </div>
        {isExpanded && (
          <div className="folder-content">
            {item.data.map((child) => renderItem(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="file-explorer" role="tree">
      {renderItem(data)}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div onClick={() => handleFileAction('copy')}>Copy</div>
          <div onClick={() => handleFileAction('delete')}>Delete</div>
          <div onClick={() => handleFileAction('rename')}>Rename</div>
        </div>
      )}
    </div>
  );
}; 