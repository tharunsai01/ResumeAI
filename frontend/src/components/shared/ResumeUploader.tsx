import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, File, CheckCircle2, X } from "lucide-react"
import { cn } from "../../lib/utils"

interface ResumeUploaderProps {
  onUpload?: (file: File) => void
  className?: string
}

export function ResumeUploader({ onUpload, className }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile)
    // Simulate upload process
    setIsUploading(true)
    setIsUploading(false)
    if (onUpload) onUpload(selectedFile)
  }

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
              isDragging
                ? "border-brand-indigo bg-brand-indigo/5"
                : "border-brand-gray hover:border-brand-indigo/50 hover:bg-brand-light"
            )}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <div className="rounded-full bg-brand-indigo/10 p-4 mb-4">
              <UploadCloud className="h-8 w-8 text-brand-indigo" />
            </div>
            <h3 className="mb-2 font-display text-lg font-medium text-brand-navy">
              Upload your Resume
            </h3>
            <p className="text-sm text-brand-navy/60">
              Drag and drop your file here, or click to browse.
            </p>
            <p className="mt-2 text-xs text-brand-navy/40">
              Supports PDF, DOCX (Max 5MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between rounded-xl border border-brand-gray bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-brand-indigo/10 p-3">
                <File className="h-6 w-6 text-brand-indigo" />
              </div>
              <div>
                <p className="font-medium text-brand-navy line-clamp-1">
                  {file.name}
                </p>
                <p className="text-xs text-brand-navy/60">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-brand-navy/60">Analyzing with AI...</div>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-indigo border-t-transparent" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm font-medium text-semantic-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Ready
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="rounded-full p-1 text-brand-navy/40 hover:bg-brand-gray/50 hover:text-brand-navy"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
