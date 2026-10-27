export interface IMediaAssetRepository {
  findAll(tenantId: string): Promise<MediaAsset[]>;
  findById(tenantId: string, id: string): Promise<MediaAsset | null>;
  create(tenantId: string, data: CreateMediaAssetData): Promise<MediaAsset>;
}

export interface CreateMediaAssetData {
  type: 'image' | 'video' | 'document' | 'signature';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  provider?: string;
  providerId?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
}

export class MediaAsset {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly type: 'image' | 'video' | 'document' | 'signature',
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly url: string,
    public readonly provider: string,
    public readonly providerId: string | null,
    public readonly metadata: Record<string, any> | null,
    public readonly createdBy: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toPlain() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      type: this.type,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      url: this.url,
      provider: this.provider,
      providerId: this.providerId,
      metadata: this.metadata,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}