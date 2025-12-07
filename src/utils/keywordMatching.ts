import { Task, TabContext, DomainPattern } from '../types';

/**
 * キーワードマッチングによる関連性スコアを計算
 */
export const calculateKeywordRelevance = (
  taskKeywords: string[],
  tabTitle: string,
  tabUrl: string,
  tabDomain: string
): number => {
  if (!taskKeywords || taskKeywords.length === 0) {
    return 0;
  }

  const searchText = `${tabTitle} ${tabUrl} ${tabDomain}`.toLowerCase();
  let matchCount = 0;
  const totalKeywords = taskKeywords.length;

  taskKeywords.forEach((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    if (searchText.includes(lowerKeyword)) {
      matchCount++;
    }
  });

  // 一致率を計算（0-1の範囲）
  const relevanceScore = matchCount / totalKeywords;

  return relevanceScore;
};

/**
 * 設定されたドメインパターンを使用してテキストを検出
 */
const detectDomainPatterns = (
  text: string,
  domainPatterns: DomainPattern[] = []
): Record<string, boolean> => {
  const lowerText = text.toLowerCase();
  const detected: Record<string, boolean> = {};

  // 設定されたパターンごとに検出
  domainPatterns.forEach((pattern) => {
    const patternId = pattern.id || pattern.name?.toLowerCase().replace(/\s+/g, '-');
    const matchesPattern = pattern.patterns?.some((p) => lowerText.includes(p.toLowerCase()));
    const matchesKeyword = pattern.keywords?.some((k) => lowerText.includes(k.toLowerCase()));

    detected[patternId] = matchesPattern || matchesKeyword;
    detected[`has${pattern.name?.replace(/\s+/g, '')}`] = matchesKeyword;
  });

  return detected;
};

/**
 * ドメインベースのコンテキストマッチング（動的判定）
 */
export const matchContextByDomain = (
  taskContextKey: string | undefined,
  taskKeywords: string[] = [],
  taskName: string = '',
  tabDomain: string,
  tabUrl: string,
  tabTitle: string,
  domainPatterns: DomainPattern[] = []
): number => {
  const searchText = `${tabDomain} ${tabUrl} ${tabTitle}`.toLowerCase();
  const contextKeyLower = taskContextKey?.toLowerCase() || '';
  const taskText = `${taskName} ${taskKeywords.join(' ')}`.toLowerCase();

  // タブのパターンを検出
  const tabPatterns = detectDomainPatterns(searchText, domainPatterns);
  const taskPatterns = detectDomainPatterns(`${contextKeyLower} ${taskText}`, domainPatterns);

  let matchScore = 0;

  // 設定されたパターンを使用したマッチング
  domainPatterns.forEach((pattern) => {
    const patternId = pattern.id || pattern.name?.toLowerCase().replace(/\s+/g, '-');
    const tabMatches = tabPatterns[patternId] || false;
    const taskMatches = taskPatterns[patternId] || false;

    // contextKeyがパターン名と一致する場合 (Explicit Context Match)
    // 例: Task Context = "GitHub", Tab Pattern matched "GitHub"
    if (contextKeyLower && (contextKeyLower === pattern.name?.toLowerCase() || 
        (pattern.name && contextKeyLower.includes(pattern.name.toLowerCase())))) {
      if (tabMatches) {
        matchScore = 1.0; // 強制的に最大スコア
        return; // ループを抜ける必要はないが、最大値が確定したのでこれ以上計算しても無駄（forEachなのでreturnはcontinue扱いだが）
      }
    }

    // タスクとタブの両方でパターンが一致する場合 (Implicit Match)
    if (taskMatches && tabMatches) {
      matchScore += 0.8; // 大幅ブースト
    }

    // キーワードマッチング
    if (pattern.keywords) {
      const keywordMatches = pattern.keywords.some((keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return taskText.includes(lowerKeyword) && searchText.includes(lowerKeyword);
      });
      if (keywordMatches) {
        matchScore += 0.5;
      }
    }
  });

  return Math.min(1.0, matchScore);
};

/**
 * 総合的なコンテキスト関連性スコアを計算
 */
export const calculateContextRelevance = (
  task: Task,
  tabContext: TabContext,
  domainPatterns: DomainPattern[] = []
): number => {
  const { url, title, domain } = tabContext;
  const { keywords = [], contextKey, name = '' } = task;

  // キーワードマッチングスコア
  const keywordScore = calculateKeywordRelevance(keywords, title, url, domain);

  // ドメインベースのコンテキストマッチング（動的判定、タスク名と親タスク名も考慮）
  const domainMatch = matchContextByDomain(
    contextKey,
    keywords,
    `${name} ${task.parentTaskName || ''}`,
    domain,
    url,
    title,
    domainPatterns
  );

  // 総合スコア: どちらかが強ければ採用する (MAX)
  // これにより、キーワードがなくてもドメインが合えば高スコアになる
  const totalScore = Math.max(keywordScore, domainMatch);

  return totalScore;
};

