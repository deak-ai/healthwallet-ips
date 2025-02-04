import { useState, useEffect } from 'react';
import { getProcessor } from '@/components/ipsResourceProcessor';
import { IpsData } from '@/components/fhirIpsModels';

export const useResourceSelection = (ipsData: IpsData | null, code: string) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAllState, setSelectAllState] = useState(false);

  // Reset state when code changes
  useEffect(() => {
    setSelectedIds([]);
    setSelectAllState(false);
  }, [code]);

  const handleSelect = (uri: string) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(uri)) {
        return prevSelectedIds.filter((selectedId) => selectedId !== uri);
      } else {
        return [...prevSelectedIds, uri];
      }
    });

    // Update selectAll state
    if (ipsData) {
      const resources = getProcessor(code).process(ipsData);
      const newSelectedIds = selectedIds.includes(uri)
        ? selectedIds.filter(id => id !== uri)
        : [...selectedIds, uri];
      setSelectAllState(newSelectedIds.length === resources.length);
    }
  };

  const handleSelectAll = () => {
    if (!ipsData) return;

    const newSelectAll = !selectAllState;
    setSelectAllState(newSelectAll);

    if (newSelectAll) {
      const resources = getProcessor(code).process(ipsData);
      setSelectedIds(resources.map(resource => resource.uri));
    } else {
      setSelectedIds([]);
    }
  };

  return {
    selectedIds,
    selectAllState,
    handleSelect,
    handleSelectAll
  };
};
