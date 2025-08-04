import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Users, Gift, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

const BulkUploadPage: React.FC = () => {
  const { user } = useAuth();
  const [uploadType, setUploadType] = useState<'people' | 'gifts'>('people');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = uploadType === 'people' 
      ? 'Name,Email,Birthday,Anniversary,Relationship,Address,Phone\nJohn Doe,john@example.com,1990-05-15,2020-06-20,Friend,"123 Main St, City, State 12345",555-1234'
      : 'RecipientName,EventType,EventDate,GiftAmount,PersonalMessage,Relationship\nJohn Doe,Birthday,2024-05-15,Personal Note and photo ($5),Happy Birthday!,Friend';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadType}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        return row;
      });
      setPreview(data.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const uploadData = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    setUploadResult(null);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        return row;
      });
      let success = 0;
      let failed = 0;
      const errors: string[] = [];
      for (const row of data) {
        try {
          if (uploadType === 'people') {
            const { error } = await supabase
              .from('people')
              .insert({
                user_id: user.id,
                name: row.Name,
                nickname: null,
                birthday: row.Birthday ? new Date(row.Birthday).toISOString() : null,
                anniversary: row.Anniversary ? new Date(row.Anniversary).toISOString() : null,
                address: row.Address || null
              });
            if (error) {
              failed++;
              errors.push(`Row ${data.indexOf(row) + 2}: ${error.message}`);
            } else {
              success++;
            }
          } else {
            // For gifts, create person if needed
            let recipientId = null;
            const { data: existingPerson } = await supabase
              .from('people')
              .select('id')
              .eq('user_id', user.id)
              .eq('name', row.RecipientName)
              .single();
            if (existingPerson) {
              recipientId = existingPerson.id;
            } else {
              const { data: newPerson, error: personError } = await supabase
                .from('people')
                .insert({
                  user_id: user.id,
                  name: row.RecipientName,
                  nickname: null,
                  birthday: null,
                  anniversary: null,
                  address: null
                })
                .select('id')
                .single();
              if (personError) {
                failed++;
                errors.push(`Row ${data.indexOf(row) + 2}: Failed to create person - ${personError.message}`);
                continue;
              }
              recipientId = newPerson.id;
            }
            const { error: giftError } = await supabase
              .from('gifts')
              .insert({
                user_id: user.id,
                recipient_id: recipientId,
                relationship: row.Relationship || 'Friend',
                event_type: row.EventType,
                event_date: new Date(row.EventDate).toISOString(),
                gift_amount: row.GiftAmount,
                personal_message: row.PersonalMessage || '',
                photo_url: '',
                status: 'not-started'
              });
            if (giftError) {
              failed++;
              errors.push(`Row ${data.indexOf(row) + 2}: ${giftError.message}`);
            } else {
              success++;
            }
          }
        } catch (error) {
          failed++;
          errors.push(`Row ${data.indexOf(row) + 2}: Unexpected error`);
        }
      }
      setUploadResult({ success, failed, errors });
    } catch (error) {
      setUploadResult({ success: 0, failed: 1, errors: ['Failed to process file'] });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Bulk Upload</h2>
              <p className="text-blue-100 text-sm">Import multiple people or gifts at once</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex gap-2">
            <Button variant={uploadType === 'people' ? 'default' : 'outline'} onClick={() => setUploadType('people')} className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>People</span>
            </Button>
            <Button variant={uploadType === 'gifts' ? 'default' : 'outline'} onClick={() => setUploadType('gifts')} className="flex items-center space-x-2">
              <Gift className="h-4 w-4" />
              <span>Gifts</span>
            </Button>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </Button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          <Button variant="default" onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Select CSV File</span>
          </Button>
        </div>
        {file && <div className="mt-4 text-sm text-gray-700"><strong>Selected file:</strong> {file.name}</div>}
      </div>
      {preview.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold mb-2">Preview (first 5 rows):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((header) => (
                    <th key={header} className="px-3 py-2 text-left font-semibold text-gray-700">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-3 py-2 border-b border-gray-100">{String(value)}</td>
                  ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {file && (
        <div className="flex justify-end">
          <Button onClick={uploadData} disabled={isUploading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            {isUploading ? (<><Upload className="mr-2 h-4 w-4 animate-bounce" />Uploading...</>) : (<><Upload className="mr-2 h-4 w-4" />Upload Data</>)}
          </Button>
        </div>
      )}
      {uploadResult && (
        <div className="mt-6">
          {uploadResult.failed === 0 ? (
            <Alert variant="default" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Upload successful! {uploadResult.success} records imported.</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {uploadResult.success} records imported, {uploadResult.failed} failed.
                <ul className="mt-2 list-disc list-inside text-xs text-red-600">
                  {uploadResult.errors.map((err, idx) => (<li key={idx}>{err}</li>))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUploadPage;