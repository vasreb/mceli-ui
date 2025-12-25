import type { VariantDto } from '@/api/types';

export type VariantColumnKey = 'text' | 'volume' | 'comp' | 'cpc';
export type SortDirection = 'asc' | 'desc';

export type NormalizedVariant = VariantDto & {
  volume: number | null;
  competition: number | null;
  cpc: number | null;
};

const toSortableNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
};

export const getVariantCellValue = (variant: NormalizedVariant, column: VariantColumnKey) => {
  switch (column) {
    case 'volume':
      return variant.volume;
    case 'comp':
      return variant.competition;
    case 'cpc':
      return variant.cpc;
    case 'text':
    default:
      return variant.text ?? variant.value ?? variant.id ?? null;
  }
};

const getSortableValue = (variant: NormalizedVariant, column: VariantColumnKey) => {
  const raw = getVariantCellValue(variant, column);
  const numeric = toSortableNumber(raw);
  return numeric ?? raw;
};

export const sortVariants = (
  variants: NormalizedVariant[],
  config: { column: VariantColumnKey; direction: SortDirection },
) => {
  if (variants.length === 0) {
    return variants;
  }

  const sorted = [...variants];
  const { column, direction } = config;

  sorted.sort((a, b) => {
    const aValue = getSortableValue(a, column);
    const bValue = getSortableValue(b, column);

    if (aValue == null && bValue == null) {
      return 0;
    }
    if (aValue == null) {
      return 1;
    }
    if (bValue == null) {
      return -1;
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    const aText = String(aValue);
    const bText = String(bValue);
    return direction === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
  });

  return sorted;
};

