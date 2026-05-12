'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, X, Check, AlertCircle, Pause, RefreshCw } from 'lucide-react';

interface FileUploadProps {
  lectureId: number;
  onUploadComplete?: (uploadId: number) => void;
  onUploadError?: (error: string) => void;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

interface UploadProgress {
  uploadId: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';
  progress: number;
  fileName: string;
  fileSize: number;
  errorMessage?: string;
  uploadUrl?: string;
}

const DEFAULT_ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',
];

const DEFAULT_MAX_SIZE = 524288000; // 500MB

export function VideoUpload({
  lectureId,
  onUploadComplete,
  onUploadError,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxSize = DEFAULT_MAX_SIZE,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [upload, setUpload] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Poll upload progress
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (upload?.uploadId && upload.status === 'uploading') {
      setIsPolling(true);
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/v1/uploads/${upload.uploadId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch upload progress');
          }

          const progress = await response.json();

          setUpload((prev) => {
            if (!prev) return null;

            return {
              ...prev,
              status: progress.status,
              progress: progress.status === 'complete' ? 100 : prev.progress,
              errorMessage: progress.errorMessage,
            };
          });

          if (progress.status === 'complete') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onUploadComplete?.(upload.uploadId);
          } else if (progress.status === 'failed') {
            setIsPolling(false);
            clearInterval(pollInterval);
            onUploadError?.(progress.errorMessage || 'Upload failed');
          }
        } catch (error) {
          console.error('Error polling upload progress:', error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [upload?.uploadId, upload?.status]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelection(files[0]);
      }
    },
    [lectureId]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onUploadError?.(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadStart = async () => {
    if (!selectedFile) return;

    try {
      abortControllerRef.current = new AbortController();

      // Request upload URL
      const response = await fetch(`/api/v1/uploads/request-url/${lectureId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request upload URL');
      }

      const uploadData = await response.json();

      setUpload({
        uploadId: uploadData.uploadId,
        status: 'uploading',
        progress: 0,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadUrl: uploadData.uploadUrl,
      });

      // Upload to S3
      await uploadToS3(uploadData.uploadUrl, selectedFile, abortControllerRef.current.signal);

      // Update status to uploading
      await fetch(`/api/v1/uploads/${uploadData.uploadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'uploading' }),
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Upload error:', error);
        onUploadError?.(error.message || 'Upload failed');
      }
    }
  };

  const uploadToS3 = async (url: string, file: File, signal: AbortSignal) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);

      // Track progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUpload((prev) => (prev ? { ...prev, progress } : null));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        reject(new DOMException('Upload aborted', 'AbortError'));
      });

      // Listen for abort signal
      signal.addEventListener('abort', () => {
        xhr.abort();
      });

      xhr.send(file);
    });
  };

  const handleCancelUpload = async () => {
    if (!upload?.uploadId) return;

    // Abort S3 upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel upload on server
    try {
      await fetch(`/api/v1/uploads/${upload.uploadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error cancelling upload:', error);
    }

    setUpload(null);
    setSelectedFile(null);
  };

  const handleRetryUpload = () => {
    setUpload(null);
    setSelectedFile(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {!upload ? (
        <>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />

            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />

            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Drag and drop your video here, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Maximum file size: {formatFileSize(maxSize)}
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Select Video
            </button>

            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
                <button
                  type="button"
                  onClick={handleUploadStart}
                  className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Start Upload
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="mt-2 w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {upload.fileName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(upload.fileSize)}
              </p>
            </div>

            {upload.status === 'uploading' && (
              <button
                type="button"
                onClick={handleCancelUpload}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Cancel upload"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {upload.status === 'failed' && (
              <button
                type="button"
                onClick={handleRetryUpload}
                className="ml-4 p-2 text-blue-500 hover:text-blue-600"
                title="Retry upload"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {upload.status === 'uploading' && (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {upload.progress.toFixed(1)}% uploaded
              </p>
              {isPolling && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Verifying upload...
                </p>
              )}
            </>
          )}

          {/* Status messages */}
          {upload.status === 'complete' && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Check className="h-5 w-5 mr-2" />
              <span>Upload complete!</span>
            </div>
          )}

          {upload.status === 'failed' && (
            <div className="flex items-start text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span>Upload failed</span>
                {upload.errorMessage && (
                  <p className="text-sm mt-1">{upload.errorMessage}</p>
                )}
              </div>
            </div>
          )}

          {upload.status === 'cancelled' && (
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Pause className="h-5 w-5 mr-2" />
              <span>Upload cancelled</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
