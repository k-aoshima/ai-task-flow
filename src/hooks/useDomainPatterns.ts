import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_DOMAIN_PATTERNS } from '../constants/defaultDomainPatterns';
import { DomainPattern } from '../types';

/**
 * ドメインパターン管理のカスタムフック
 */
export const useDomainPatterns = () => {
  const [patterns, setPatterns] = useLocalStorage<DomainPattern[]>(
    'aiTaskFlow_domainPatterns',
    DEFAULT_DOMAIN_PATTERNS
  );

  const addPattern = (pattern: Omit<DomainPattern, 'id'> & { id?: string }) => {
    const newPattern: DomainPattern = {
      ...pattern,
      id: pattern.id || crypto.randomUUID(),
    };
    setPatterns((prev) => [...prev, newPattern]);
  };

  const updatePattern = (id: string, updates: Partial<DomainPattern>) => {
    setPatterns((prev) =>
      prev.map((pattern) => (pattern.id === id ? { ...pattern, ...updates } : pattern))
    );
  };

  const deletePattern = (id: string) => {
    setPatterns((prev) => prev.filter((pattern) => pattern.id !== id));
  };

  const resetToDefault = () => {
    setPatterns(DEFAULT_DOMAIN_PATTERNS);
  };

  return {
    patterns,
    addPattern,
    updatePattern,
    deletePattern,
    resetToDefault,
  };
};

