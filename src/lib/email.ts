import type { Transporter } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer | Uint8Array | string;
  contentType?: string;
}

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId?: string | null;
  skippedReason?: string | null;
}

interface EmailProvider {
  name: string;
  isConfigured(): boolean;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

function getProviderName() {
  return (process.env.EMAIL_PROVIDER ?? 'console').trim().toLowerCase();
}

function getSenderAddress() {
  return process.env.EMAIL_FROM?.trim() || 'SEO Audit <no-reply@localhost>';
}

class ConsoleEmailProvider implements EmailProvider {
  name = 'console';

  isConfigured() {
    return true;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    console.info('[email:console]', {
      to: message.to,
      subject: message.subject,
      previewText: message.text?.slice(0, 240) ?? null,
      attachments: message.attachments?.map((attachment) => attachment.filename) ?? [],
    });

    return {
      success: true,
      provider: this.name,
      messageId: `console-${Date.now()}`,
    };
  }
}

class SmtpEmailProvider implements EmailProvider {
  name = 'smtp';
  private transporterPromise: Promise<Transporter> | null = null;

  isConfigured() {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
    );
  }

  private getTransporter() {
    if (!this.transporterPromise) {
      this.transporterPromise = (async () => {
        const nodemailerModule = await import('nodemailer');
        const createTransport = nodemailerModule.createTransport;

        return createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      })();
    }

    return this.transporterPromise;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        provider: this.name,
        skippedReason: 'SMTP provider is not fully configured.',
      };
    }

    const transporter = await this.getTransporter();
    const info = await transporter.sendMail({
      from: getSenderAddress(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      replyTo: message.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    return {
      success: true,
      provider: this.name,
      messageId: info.messageId ?? null,
    };
  }
}

function resolveProvider(): EmailProvider {
  switch (getProviderName()) {
    case 'smtp':
      return new SmtpEmailProvider();
    case 'console':
    default:
      return new ConsoleEmailProvider();
  }
}

export function getEmailProviderStatus() {
  const provider = resolveProvider();
  return {
    provider: provider.name,
    configured: provider.isConfigured(),
    from: getSenderAddress(),
  };
}

export async function sendEmail(message: EmailMessage): Promise<EmailSendResult> {
  const provider = resolveProvider();
  if (!provider.isConfigured()) {
    return {
      success: false,
      provider: provider.name,
      skippedReason: `${provider.name} provider is not configured.`,
    };
  }

  return provider.send(message);
}
