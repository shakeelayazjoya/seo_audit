import { createHash } from 'node:crypto';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

function normalizeDomain(domain: string) {
  return domain
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/g, '')
    .toLowerCase();
}

function buildAuditReportPublicId(domain: string) {
  const slug = normalizeDomain(domain).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `seo-audit-reports/${slug}/latest-audit-report`;
}

async function destroyRawAsset(publicId: string) {
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = buildSignature(
    {
      invalidate: 'true',
      public_id: publicId,
      timestamp,
    },
    apiSecret
  );

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp,
    api_key: apiKey,
    invalidate: 'true',
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/destroy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary destroy failed: ${detail}`);
  }
}

async function destroyImageAsset(publicId: string) {
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = buildSignature(
    {
      invalidate: 'true',
      public_id: publicId,
      timestamp,
    },
    apiSecret
  );

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp,
    api_key: apiKey,
    invalidate: 'true',
    signature,
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary image destroy failed: ${detail}`);
  }
}

export async function uploadLatestAuditPdf(input: {
  domain: string;
  filename: string;
  pdf: Buffer;
}) {
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
  const publicId = buildAuditReportPublicId(input.domain);

  await destroyRawAsset(publicId).catch(() => {});

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uploadSignatureParams = {
    filename_override: input.filename,
    folder: 'seo-audit-reports',
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(uploadSignatureParams, apiSecret);

  const formData = new FormData();
  const pdfBytes = new Uint8Array(input.pdf);
  formData.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), input.filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('public_id', publicId);
  formData.append('folder', 'seo-audit-reports');
  formData.append('resource_type', 'raw');
  formData.append('overwrite', 'true');
  formData.append('filename_override', input.filename);
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary upload failed: ${detail}`);
  }

  const payload = await response.json();

  return {
    publicId,
    secureUrl: payload.secure_url as string,
    assetId: payload.asset_id as string | undefined,
    version: payload.version as number | undefined,
  };
}

export async function uploadBlogCoverImage(input: {
  file: File;
  slug: string;
  previousPublicId?: string | null;
}) {
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
  const publicId = `seo-audit-blog/${input.slug.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()}`;

  if (input.previousPublicId) {
    await destroyImageAsset(input.previousPublicId).catch(() => {});
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const uploadSignatureParams = {
    folder: 'seo-audit-blog',
    overwrite: 'true',
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(uploadSignatureParams, apiSecret);

  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('public_id', publicId);
  formData.append('folder', 'seo-audit-blog');
  formData.append('overwrite', 'true');
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary image upload failed: ${detail}`);
  }

  const payload = await response.json();

  return {
    publicId,
    secureUrl: payload.secure_url as string,
    assetId: payload.asset_id as string | undefined,
    version: payload.version as number | undefined,
  };
}
