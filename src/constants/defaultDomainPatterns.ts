import { DomainPattern } from '../types';

/**
 * デフォルトのドメインパターン設定
 */
export const DEFAULT_DOMAIN_PATTERNS: DomainPattern[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    patterns: ['gmail.com', 'mail.google.com'],
    keywords: ['gmail', 'mail', 'メール', 'email'],
  },
  {
    id: 'drive',
    name: 'Google Drive',
    patterns: [
      'drive.google.com',
      'docs.google.com',
      'sheets.google.com',
      'slides.google.com',
    ],
    keywords: ['drive', 'docs', 'sheets', 'slides', 'ドライブ', 'ドキュメント'],
  },
  {
    id: 'deploy-console',
    name: 'Deploy Console',
    patterns: ['console', 'deploy', 'aws', 'gcp', 'azure'],
    keywords: ['console', 'deploy', 'デプロイ', 'コンソール', 'aws', 'gcp', 'azure'],
  },
];

