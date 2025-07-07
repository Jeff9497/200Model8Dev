'use client';

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Code } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File, content: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function FileUpload({ onFileSelect, onClose, isOpen }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      // Check file type
      const isImage = file.type.startsWith('image/');
      const isText = file.type.startsWith('text/') || 
                    file.name.endsWith('.js') || 
                    file.name.endsWith('.ts') || 
                    file.name.endsWith('.jsx') || 
                    file.name.endsWith('.tsx') || 
                    file.name.endsWith('.py') || 
                    file.name.endsWith('.java') || 
                    file.name.endsWith('.cpp') || 
                    file.name.endsWith('.c') || 
                    file.name.endsWith('.cs') || 
                    file.name.endsWith('.php') || 
                    file.name.endsWith('.rb') || 
                    file.name.endsWith('.go') || 
                    file.name.endsWith('.rs') || 
                    file.name.endsWith('.swift') || 
                    file.name.endsWith('.kt') || 
                    file.name.endsWith('.html') || 
                    file.name.endsWith('.css') || 
                    file.name.endsWith('.scss') || 
                    file.name.endsWith('.json') || 
                    file.name.endsWith('.xml') || 
                    file.name.endsWith('.yaml') || 
                    file.name.endsWith('.yml') || 
                    file.name.endsWith('.sql') || 
                    file.name.endsWith('.sh') || 
                    file.name.endsWith('.md');

      if (!isImage && !isText) {
        alert('Please upload an image or text/code file');
        return;
      }

      let content = '';
      
      if (isImage) {
        // For images, we'll create a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          content = `[Image: ${file.name}]\nData URL: ${dataUrl}`;
          onFileSelect(file, content);
          onClose();
        };
        reader.readAsDataURL(file);
      } else {
        // For text files, read the content
        const reader = new FileReader();
        reader.onload = (e) => {
          content = e.target?.result as string;
          const fileContent = `[File: ${file.name}]\n\n${content}`;
          onFileSelect(file, fileContent);
          onClose();
        };
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i)) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <Code className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload File
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Supports images and code files (max 10MB)
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Choose File
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Supported formats:</p>
          <p>• Images: JPG, PNG, GIF, SVG, WebP</p>
          <p>• Code: JS, TS, Python, Java, C++, HTML, CSS, JSON, etc.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          accept="image/*,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.html,.css,.scss,.json,.xml,.yaml,.yml,.sql,.sh,.md,.txt"
          className="hidden"
        />
      </div>
    </div>
  );
}
