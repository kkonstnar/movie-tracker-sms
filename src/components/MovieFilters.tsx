import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Select from 'react-select';
import { tmdb, type Genre, type Person } from '../lib/tmdb';

interface FilterOption {
  value: string;
  label: string;
}

interface MovieFiltersProps {
  onGenreChange: (genreId: number | null) => void;
  onPersonChange: (personId: number | null) => void;
}

export function MovieFilters({ onGenreChange, onPersonChange }: MovieFiltersProps) {
  const [personSearch, setPersonSearch] = React.useState('');

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => tmdb.getGenres(),
  });

  const { data: people } = useQuery({
    queryKey: ['searchPeople', personSearch],
    queryFn: () => tmdb.searchPeople(personSearch),
    enabled: personSearch.length > 2,
  });

  const genreOptions: FilterOption[] = React.useMemo(() => {
    if (!genres) return [];
    return genres.genres.map((genre: Genre) => ({
      value: genre.id.toString(),
      label: genre.name,
    }));
  }, [genres]);

  const personOptions: FilterOption[] = React.useMemo(() => {
    if (!people) return [];
    return people.results.map((person: Person) => ({
      value: person.id.toString(),
      label: `${person.name} (${person.known_for_department})`,
    }));
  }, [people]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Select
        className="w-full sm:w-64"
        classNames={{
          control: () => 'bg-[#1E293B] border-gray-700 hover:border-indigo-500',
          menu: () => 'bg-[#1E293B] border border-gray-700',
          option: (state) => 
            `${state.isFocused ? 'bg-indigo-500/20' : ''} ${
              state.isSelected ? 'bg-indigo-500' : ''
            }`,
          input: () => 'text-white',
          singleValue: () => 'text-white',
        }}
        placeholder="Filter by genre..."
        options={genreOptions}
        isClearable
        onChange={(option) => onGenreChange(option ? parseInt(option.value) : null)}
      />

      <Select
        className="w-full sm:w-64"
        classNames={{
          control: () => 'bg-[#1E293B] border-gray-700 hover:border-indigo-500',
          menu: () => 'bg-[#1E293B] border border-gray-700',
          option: (state) => 
            `${state.isFocused ? 'bg-indigo-500/20' : ''} ${
              state.isSelected ? 'bg-indigo-500' : ''
            }`,
          input: () => 'text-white',
          singleValue: () => 'text-white',
        }}
        placeholder="Search cast & crew..."
        options={personOptions}
        isClearable
        onInputChange={(value) => setPersonSearch(value)}
        onChange={(option) => onPersonChange(option ? parseInt(option.value) : null)}
        isLoading={personSearch.length > 2 && !people}
        noOptionsMessage={() => 
          personSearch.length <= 2 
            ? "Type 3 or more characters to search..." 
            : "No results found"
        }
      />
    </div>
  );
}