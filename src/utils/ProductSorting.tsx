import { useTheme } from '../utils/context/theme-context';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductShowcase from '../components/ProductShowcase';

function ChevronUpIcon() {
    return (
        <svg
            className="h-4 w-4 text-current"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
        >
            <polyline points="18 15 12 9 6 15" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            className="h-4 w-4 text-current"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function BoldChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export default function CustomSortDropdown({ sortOption, setSortOption, closeMenu }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const { theme } = useTheme();

    const sortOptions = [
        { value: '', labelKey: 'sortDropdown.defaultLabel' },
        { value: 'price', mainKey: 'sortDropdown.options.price.main', descKey: 'sortDropdown.options.price.description' },
        { value: 'electric', mainKey: 'sortDropdown.options.electric.main', descKey: 'sortDropdown.options.electric.description' },
        { value: 'hydraulic', mainKey: 'sortDropdown.options.hydraulic.main', descKey: 'sortDropdown.options.hydraulic.description' },
        { value: 'depth', mainKey: 'sortDropdown.options.depth.main', descKey: 'sortDropdown.options.depth.description' },
        { value: 'magazines', mainKey: 'sortDropdown.options.magazines.main', descKey: 'sortDropdown.options.magazines.description' }
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedValue = sortOption.split('-')[0];
    const selectedOrder = sortOption.split('-')[1];

    const getSelectedLabel = () => {
        const option = sortOptions.find(opt => opt.value === selectedValue);
        if (!option) return t('sortDropdown.defaultLabel');

        if (option.value === '') return t(option.labelKey);
        return (
            <>
                <strong>{t(option.mainKey)}</strong> ({t(option.descKey)})
            </>
        );
    };

    function onSelect(value: string) {
        setSortOption(value ? `${value}-asc` : '');
        if (closeMenu) closeMenu();
        else setIsOpen(false);
    }

    function toggleSortOrder() {
        if (!sortOption) return;
        const newOrder = selectedOrder === 'asc' ? 'desc' : 'asc';
        setSortOption(`${selectedValue}-${newOrder}`);
    }

    function clearSort() {
        setSortOption('');
    }

    return (
        <div
            ref={dropdownRef}
            className="relative inline-flex items-center gap-1"
        >
            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brandgreen focus:ring-offset-1 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
                type="button"
            >
                <span className="mr-2 whitespace-nowrap text-sm">{getSelectedLabel()}</span>
                <BoldChevronIcon open={isOpen} />
            </button>

            {/* Sort Order Button */}
            <button
                onClick={toggleSortOrder}
                disabled={!sortOption}
                className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-md transition-colors ${
                    !sortOption
                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed border border-gray-200 dark:border-gray-600'
                        : 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-brandgreen dark:hover:bg-brandgreen hover:text-white'
                }`}
                type="button"
                aria-label={t('sortDropdown.ariaLabels.toggleSort')}
            >
                {sortOption && (selectedOrder === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />)}
            </button>

            {/* Clear Sort Button */}
            <button
                onClick={clearSort}
                disabled={!sortOption}
                className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-md transition-colors ${
                    !sortOption
                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-700 cursor-not-allowed border border-gray-200 dark:border-gray-600'
                        : 'text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-brandorange dark:hover:bg-brandorange hover:text-white'
                }`}
                type="button"
                aria-label={t('sortDropdown.ariaLabels.clearSort')}
            >
                <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Dropdown List */}
            {isOpen && (
                <ul
                    className="absolute z-50 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none left-0 bottom-full mb-1 md:top-full md:mt-1 md:bottom-auto"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    {sortOptions.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            className={`cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                selectedValue === option.value
                                    ? 'font-semibold bg-gray-100 dark:bg-gray-700'
                                    : 'text-gray-700 dark:text-gray-300'
                            }`}
                            role="menuitem"
                            tabIndex={-1}
                        >
                            <div className="flex flex-col">
                                <span className={selectedValue === option.value ? 'text-brandgreen' : ''}>
                                    {option.value === ''
                                        ? t(option.labelKey)
                                        : <>
                                            <strong>{t(option.mainKey)}</strong> ({t(option.descKey)})
                                          </>}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
