import React, { useEffect, useRef, useState } from 'react';
import { documentsApi, DocumentDTO } from '@/api/documents';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const MAX_MB = 20;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const load = async (p = 1) => {
    setLoading(true);
    try {
  const res = await documentsApi.list(p, 20);
  if (res.success === false) throw new Error('Failed');
  setDocs(res.data);
  setPage(res.meta.page);
  setTotalPages(res.meta.totalPages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load documents';
      toast({ variant: 'destructive', description: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return setFile(null);
    if (f.size > MAX_MB * 1024 * 1024) {
      toast({ variant: 'destructive', description: `Max file size ${MAX_MB}MB` });
      return;
    }
    setFile(f);
  };

  const onUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
  setProgress(0);
  await documentsApi.upload(file, (pct) => setProgress(pct));
      toast({ description: 'Uploaded!' });
      setFile(null);
  setProgress(0);
      if (fileRef.current) fileRef.current.value = '';
      load(page);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      toast({ variant: 'destructive', description: msg });
    } finally {
      setLoading(false);
    }
  };

  const onDownload = async (id: string) => {
    try {
      const res = await documentsApi.getSignedUrl(id);
      const url = res.data.signedUrl;
      if (url) window.open(url, '_blank', 'noopener');
    } catch {
      toast({ variant: 'destructive', description: 'Failed to get download link' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Upload and manage documents</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Input type="file" ref={fileRef} onChange={onFileChange} />
            <Button onClick={onUpload} disabled={!file || loading}>Upload</Button>
            {file && <Badge variant="secondary">{file.name} {progress ? `• ${progress}%` : ''}</Badge>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>{d.mimeType}</TableCell>
                      <TableCell>{d.fileSize ? (Number(d.fileSize) / 1024 / 1024).toFixed(2) + ' MB' : '-'}</TableCell>
                      <TableCell>{new Date(d.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary" onClick={() => onDownload(d.id)}>Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {docs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No documents found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
