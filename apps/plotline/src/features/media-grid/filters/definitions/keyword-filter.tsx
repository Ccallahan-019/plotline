'use client'

import type { TmdbKeyword } from '@plotline/shared/tmdb'

import { useId, useMemo, useState } from 'react'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Field, FieldLabel } from '@/components/ui/field'
import { useTmdbKeywords } from '@/features/search/hooks/use-tmdb-keywords'
import { MIN_TMDB_QUERY_LENGTH } from '@/features/search/services/search-filters'

import type { FilterDefinition, FilterFieldRenderProps } from '../types'

import { keepKeywordPopupOpenOnItemPress } from './keyword-filter-popup'

export const KEYWORD_FILTER_KEY = 'keywords'

const EMPTY_KEYWORDS: TmdbKeyword[] = []

type KeywordListState = 'empty' | 'error' | 'loading' | 'results' | 'too-short'

function getKeywordBadgeLabel(keywords: readonly { name: string }[]): string {
  return keywords.map((keyword) => keyword.name).join(', ')
}

function getKeywordEmptyMessage(state: KeywordListState): string {
  switch (state) {
    // 'results' never renders this message (the popup lists the rows); it shares the text for exhaustiveness.
    case 'empty':
    case 'results':
      return 'No matches'
    case 'error':
      return 'Could not load keywords.'
    case 'loading':
      return 'Searching…'
    case 'too-short':
      return 'Type at least 2 characters'
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}

/**
 * Decides what the keyword popup should show.
 *
 * Queries under the title-search minimum, and searches that have not settled,
 * stay off the list so the empty state can explain them. A settled response
 * with no rows is "no matches"; rows become the selectable list.
 */
function getKeywordListState(snapshot: {
  debouncedQuery: string
  hasData: boolean
  isError: boolean
  isFetching: boolean
  isPending: boolean
  query: string
  resultCount: number
}): KeywordListState {
  if (snapshot.query.length < MIN_TMDB_QUERY_LENGTH) {
    return 'too-short'
  }

  const isWaiting =
    snapshot.query !== snapshot.debouncedQuery ||
    snapshot.isPending ||
    (snapshot.isFetching && !snapshot.hasData)

  if (isWaiting) {
    return 'loading'
  }

  if (snapshot.isError) {
    return 'error'
  }

  if (snapshot.resultCount === 0) {
    return 'empty'
  }

  return 'results'
}

function KeywordFilterField({ draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const [query, setQuery] = useState('')
  const inputId = useId()
  const anchor = useComboboxAnchor()
  const selected = draftFilters.keywords ?? EMPTY_KEYWORDS
  const keywordsQuery = useTmdbKeywords(query)
  const trimmedQuery = query.trim()
  const listState = getKeywordListState({
    debouncedQuery: keywordsQuery.debouncedQuery,
    hasData: keywordsQuery.data !== undefined,
    isError: keywordsQuery.isError,
    isFetching: keywordsQuery.isFetching,
    isPending: keywordsQuery.isPending,
    query: trimmedQuery,
    resultCount: keywordsQuery.data?.results.length ?? 0,
  })
  const searchResults = useMemo(() => {
    if (listState !== 'results') {
      return EMPTY_KEYWORDS
    }

    return (keywordsQuery.data?.results ?? EMPTY_KEYWORDS).map(toKeywordSelection)
  }, [keywordsQuery.data?.results, listState])
  const items = useMemo(
    () => mergeKeywordOptions(searchResults, selected),
    [searchResults, selected],
  )
  const placeholder = selected.length > 0 ? '' : 'Search keywords'

  const handleValueChange = (nextKeywords: TmdbKeyword[]) => {
    setDraftFilters({
      ...draftFilters,
      keywords: nextKeywords.length > 0 ? nextKeywords.map(toKeywordSelection) : undefined,
    })
  }

  return (
    <Field>
      <FieldLabel className="mb-2 font-semibold" htmlFor={inputId}>
        Keywords
      </FieldLabel>
      <Combobox<TmdbKeyword, true>
        // Popup lists typeahead hits only. Selected keywords stay on `items` so chips
        // keep their labels after the result set changes.
        filteredItems={searchResults}
        inputValue={query}
        isItemEqualToValue={(left, right) => left?.id === right?.id}
        items={items}
        itemToStringLabel={(item) => item?.name ?? ''}
        multiple
        onInputValueChange={setQuery}
        onOpenChange={keepKeywordPopupOpenOnItemPress}
        onValueChange={handleValueChange}
        value={selected}
      >
        <ComboboxChips className="w-full" ref={anchor}>
          <ComboboxValue>
            {(value: TmdbKeyword[]) =>
              value.map((keyword) => <ComboboxChip key={keyword.id}>{keyword.name}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput id={inputId} placeholder={placeholder} />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{getKeywordEmptyMessage(listState)}</ComboboxEmpty>
          <ComboboxList>
            {(keyword: TmdbKeyword) => (
              <ComboboxItem key={keyword.id} value={keyword}>
                {keyword.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}

// Keeps already selected keywords in the item list after a new typeahead response replaces the matches.
function mergeKeywordOptions(
  results: readonly TmdbKeyword[],
  selected: readonly TmdbKeyword[],
): TmdbKeyword[] {
  const byId = new Map<number, TmdbKeyword>()

  for (const keyword of results) {
    byId.set(keyword.id, keyword)
  }

  for (const keyword of selected) {
    if (!byId.has(keyword.id)) {
      byId.set(keyword.id, keyword)
    }
  }

  return [...byId.values()]
}

function toKeywordSelection(keyword: TmdbKeyword): { id: number; name: string } {
  return { id: keyword.id, name: keyword.name }
}

export const keywordFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  key: KEYWORD_FILTER_KEY,
  label: 'Keywords',
  remove: (filters) => {
    const next = { ...filters }
    delete next.keywords
    return next
  },
  render: (props) => <KeywordFilterField {...props} />,
  toBadge: (filters) => {
    if (!filters.keywords?.length) {
      return null
    }

    return {
      key: KEYWORD_FILTER_KEY,
      label: getKeywordBadgeLabel(filters.keywords),
      prefix: 'Keywords',
    }
  },
}
