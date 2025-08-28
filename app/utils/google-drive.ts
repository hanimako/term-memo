export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

export class GoogleDriveAPI {
  private static async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/google-drive/token');
      if (response.ok) {
        const data = await response.json();
        return data.accessToken;
      }
    } catch (error) {
      console.error('Failed to get access token:', error);
    }
    return null;
  }

  static async listFiles(): Promise<GoogleDriveFile[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name%3D%22term-memo-data.json%22&orderBy=modifiedTime%20desc&pageSize=10',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list files');
    }

    const data = await response.json();
    return data.files || [];
  }

  static async uploadFile(fileName: string, content: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    // 既存のファイルを検索
    const existingFiles = await this.listFiles();
    const existingFile = existingFiles.find(file => file.name === fileName);

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const url = existingFile
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = existingFile ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const data = await response.json();
    return data.id;
  }

  static async downloadFile(fileId: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return await response.text();
  }

  static async getLatestFile(): Promise<GoogleDriveFile | null> {
    const files = await this.listFiles();
    return files.length > 0 ? files[0] : null;
  }
}
