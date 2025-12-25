import { useMemo, useState, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { ClusterRoot } from '@/api/types';
import {
  getVariantCellValue,
  NormalizedVariant,
  sortVariants,
  SortDirection,
  VariantColumnKey,
} from './VariantsRootUtils';

const VARIANT_COLUMNS: { key: VariantColumnKey; label: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'volume', label: 'Volume' },
  { key: 'comp', label: 'Competition' },
  { key: 'cpc', label: 'CPC' },
];

const formatVariantValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'object') {
    try {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

type VariantsRootProps = {
  root: ClusterRoot;
  rootIndex: number;
};

export const VariantsRoot = ({ root, rootIndex }: VariantsRootProps) => {
  const [sortConfig, setSortConfig] = useState<{ column: VariantColumnKey; direction: SortDirection }>({
    column: 'volume',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedVariants = useMemo<NormalizedVariant[]>(() => {
    return (root.variants || []).map((variant) => ({
      ...variant,
      volume: variant.volume ?? variant.searchVolume ?? null,
      competition: variant.competition ?? null,
      cpc: variant.cpc ?? null,
    }));
  }, [root.variants]);

  const handleSortChange = useCallback((column: VariantColumnKey) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        column,
        direction: 'desc',
      };
    });
  }, []);

  const matchedVariants = useMemo(() => {
    if (!searchTerm) {
      return normalizedVariants;
    }
    const term = searchTerm.toLowerCase();
    return normalizedVariants.filter((variant) => {
      const text = String(variant.text ?? '');
      return text.toLowerCase().includes(term);
    });
  }, [normalizedVariants, searchTerm]);

  const sortedVariants = useMemo(
    () => sortVariants(matchedVariants, sortConfig),
    [matchedVariants, sortConfig],
  );
  const handleAccordionChange = useCallback(
    (_event: SyntheticEvent, expanded: boolean) => {
      setIsExpanded(expanded);
    },
    [],
  );

  return (
    <Card key={rootIndex} elevation={2}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {root.text || `Root ${rootIndex + 1}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Variants: {normalizedVariants.length}
        </Typography>
        <Accordion expanded={isExpanded} onChange={handleAccordionChange}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Variants</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {isExpanded ? (
              <>
                <Box sx={{ mb: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Search variants by text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </Box>
                {sortedVariants.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {VARIANT_COLUMNS.map(({ key, label }) => {
                            const indicator =
                              sortConfig.column === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : '';
                            return (
                              <TableCell
                                key={key}
                                onClick={() => handleSortChange(key)}
                                sx={{ cursor: 'pointer', userSelect: 'none' }}
                              >
                                {label + indicator}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedVariants.map((variant, variantIndex) => (
                          <TableRow key={`${rootIndex}-${variantIndex}`}>
                            {VARIANT_COLUMNS.map(({ key }) => (
                              <TableCell key={`${rootIndex}-${variantIndex}-${key}`}>
                                {formatVariantValue(getVariantCellValue(variant, key))}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? 'No variants match the search' : 'No variants available'}
                  </Typography>
                )}
              </>
            ) : null}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

