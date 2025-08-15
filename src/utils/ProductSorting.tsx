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

function BoldChevronIcon({ open }) {
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

export default function CustomSortDropdown({ sortOption, setSortOption, closeMenu }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { t } = useTranslation();

    // Store only translation keys
    const sortOptions = [
        { value: '', labelKey: 'sortDropdown.defaultLabel' },
        { value: 'price', mainKey: 'sortDropdown.options.price.main', descKey: 'sortDropdown.options.price.description' },
        { value: 'electric', mainKey: 'sortDropdown.options.electric.main', descKey: 'sortDropdown.options.electric.description' },
        { value: 'hydraulic', mainKey: 'sortDropdown.options.hydraulic.main', descKey: 'sortDropdown.options.hydraulic.description' },
        { value: 'depth', mainKey: 'sortDropdown.options.depth.main', descKey: 'sortDropdown.options.depth.description' },
        { value: 'magazines', mainKey: 'sortDropdown.options.magazines.main', descKey: 'sortDropdown.options.magazines.description' }
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

    function onSelect(value) {
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
            className="relative inline-flex items-center gap-1 bg-white rounded-md"
        >
            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brandgreen focus:ring-offset-1 transition-colors"
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
                className={`p-2 rounded-md transition-colors ${!sortOption
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200'
                    : 'text-gray-700 border border-gray-300 hover:bg-brandgreen hover:text-white hover:border-brandgreen'
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
                className={`p-2 rounded-md transition-colors ${!sortOption
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed border border-gray-200'
                    : 'text-gray-700 border border-gray-300 hover:bg-brandorange hover:text-white hover:border-brandorange'
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
                    className="absolute z-50 w-56 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none left-0 bottom-full mb-1 md:top-full md:mt-1 md:bottom-auto"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                >
                    {sortOptions.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => onSelect(option.value)}
                            className={`cursor-pointer select-none relative py-2 px-4 hover:bg-gray-100 ${selectedValue === option.value ? 'font-semibold bg-gray-100' : 'text-gray-700'
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
                                          </>
                                    }
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
