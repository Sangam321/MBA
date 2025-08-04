import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, File, Upload, X } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file only.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading || processing
  });

  const removeFile = () => {
    setUploadedFile(null);
    setProgress(0);
    setProcessing(false);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 300);

    try {
      await onFileUpload(uploadedFile);
      setProgress(100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze the CSV file.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setProcessing(false);
      }, 500);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#4169E1]" />
          </div>
          Upload Transaction Data
        </CardTitle>
        <CardDescription className="text-slate-600 text-base leading-relaxed">
          Upload a CSV file containing transaction data for comprehensive market basket analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragActive
              ? 'border-[#4169E1] bg-[#4169E1] bg-opacity-5 scale-[1.02]'
              : 'border-slate-300 hover:border-[#4169E1] hover:bg-[#4169E1] hover:bg-opacity-5'
              } ${isLoading || processing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${isDragActive ? 'bg-[#4169E1] bg-opacity-20' : 'bg-slate-100'}`}>
                <Upload className={`h-8 w-8 transition-colors duration-200 ${isDragActive ? 'text-[#4169E1]' : 'text-slate-500'}`} />
              </div>
              {isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-[#4169E1] mb-2">Drop the CSV file here</p>
                  <p className="text-sm text-slate-500">Release to upload your transaction data</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-slate-700 mb-2">
                    Drag & drop your CSV file here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Supported format: CSV files with items separated by commas and transactions on separate lines
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <File className="h-6 w-6 text-[#4169E1]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">{uploadedFile.name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{(uploadedFile.size / 1024).toFixed(2)} KB</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      CSV Format
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isLoading || processing}
                className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!processing && (
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || processing}
                className="w-full h-12 bg-[#4169E1] hover:bg-[#4169E1]/90 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <Upload className="w-4 h-4 mr-2" />
                Start Analysis
              </Button>
            )}

            {processing && (
              <div className="space-y-4 p-6 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 rounded-xl border border-[#4169E1]/20">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">Processing transaction data...</p>
                  <span className="text-sm text-[#4169E1] font-semibold">{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  className="w-full h-2 bg-slate-200"
                />
                <p className="text-xs text-slate-500">
                  Analyzing patterns and generating insights from your data
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;