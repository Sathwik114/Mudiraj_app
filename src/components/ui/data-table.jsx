'use client';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';
import { Filter, X, Search, ChevronsUpDown, ArrowUp, ArrowDown, Check, Download, LayoutTemplate, RefreshCcw, FileSearch, RotateCcw, Inbox } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SingleSelectCombobox = ({ options, selected, onSelectedChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const selectedLabel = options.find(opt => opt.value === selected)?.label;
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full justify-between h-8 px-2.5 font-normal text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronsUpDown className="h-3 w-3 ml-2 shrink-0 opacity-50 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md" align="start">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                            {options.map(o => 
                                (<CommandItem 
                                    key={o.value} 
                                    onSelect={() => { onSelectedChange(o.value); setOpen(false); }}
                                    className="cursor-pointer"
                                >
                                    {o.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const MultiSelectCombobox = ({ options, selected, onSelectedChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const handleSelect = (val) => onSelectedChange(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full justify-between h-8 px-2.5 font-normal text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-1 truncate">
                        {selected.length > 0 ? (
                            <span className="font-semibold text-sky-600 dark:text-sky-400">{selected.length} selected</span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-3 w-3 ml-2 opacity-50 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md" align="start">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem onSelect={() => onSelectedChange([])} className="justify-center text-destructive cursor-pointer font-medium hover:bg-red-50 dark:hover:bg-red-950/20">
                                Clear Selection
                            </CommandItem>
                            {options.map(o => (
                                <CommandItem key={o.value} value={o.value} onSelect={() => handleSelect(o.value)} className="cursor-pointer">
                                    <Check className={cn("mr-2 h-4 w-4 text-sky-500", selected.includes(o.value) ? "opacity-100" : "opacity-0")} />
                                    {o.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const ColumnFilterPopover = ({ column, data, activeFilters, onFilterChange }) => {
    const options = useMemo(() => {
        const uniqueValues = Array.from(new Set(data.map(item => item[column.key]))).filter(v => v !== null && v !== undefined && v !== '');
        return uniqueValues.map(v => ({ label: String(v), value: String(v) }));
    }, [data, column.key]);
    const selectedValues = activeFilters[column.key] || [];
    const handleSelect = (value) => { const newSelected = selectedValues.includes(value) ? selectedValues.filter(item => item !== value) : [...selectedValues, value]; onFilterChange(column.key, newSelected); };
    const handleSelectAll = () => onFilterChange(column.key, options.map(opt => opt.value));
    const handleClear = () => onFilterChange(column.key, []);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-5 w-5 ml-1 rounded-md transition-colors ${selectedValues.length > 0 ? 'text-white bg-sky-600 dark:bg-sky-800' : 'text-sky-900/80 hover:text-sky-950 hover:bg-sky-500/30 dark:text-sky-100/80 dark:hover:text-white dark:hover:bg-sky-700/50'}`} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <Filter className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md" align="center">
                <Command>
                    <CommandInput placeholder={`Filter ${column.label}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            <div className='flex flex-row justify-between gap-2 items-center px-2 py-1.5 border-b border-slate-100 dark:border-slate-800/80'>
                                <CommandItem 
                                    onSelect={handleSelectAll} 
                                    className="font-medium cursor-pointer w-full justify-center text-xs py-1"
                                >
                                    Select All
                                </CommandItem>
                                <CommandItem 
                                    onSelect={handleClear} 
                                    className="font-medium cursor-pointer p-1 text-destructive"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </CommandItem>
                            </div>
                        </CommandGroup>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {options.map(option => 
                                (<CommandItem 
                                    key={option.value} 
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer text-xs"
                                >
                                    <Check className={cn("mr-2 h-3.5 w-3.5 text-sky-500", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")} />
                                    {column.renderFilterOption ? column.renderFilterOption(option.value) : <span>{option.label}</span>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {selectedValues.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem 
                                        onSelect={() => onFilterChange(column.key, [])} 
                                        className="text-destructive justify-center text-xs cursor-pointer font-semibold py-1.5"
                                    >
                                        Clear Filter
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default function DataTable({ 
    columns, 
    data, 
    onRowClick, 
    renderCell, 
    actionColumn, 
    onFilteredDataChange, 
    isLoading, 
    exportHeading = "Data Export", 
    exportFileName = "table_export.xlsx", 
    exportExtraRows = [],
    maxHeight = "max-h-[calc(100vh-280px)]",
    hideExport = false,
    rowClassName,
    onRefresh,
    searchPlaceholder = "Search records...",
    emptyStateIcon: EmptyStateIcon = Inbox,
    emptyStateTitle = "All clear!",
    emptyStateDescription = "There are no open transactions right now. Everything is running smoothly.",
    emptyStateAction
}) {
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 25 });
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState({});
    const [headerSearchColumn, setHeaderSearchColumn] = useState(columns.find(c => !c.hidden)?.key || columns[0]?.key);
    const [headerSearchValues, setHeaderSearchValues] = useState([]);
    const [sortConfig, setSortConfig] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    const [isExporting, setIsExporting] = useState(false);
    const containerRef = useRef(null);

    const exportToExcel = () => {
        setIsExporting(true);
        try {
            if (!processedData.length) return;
            const headers = columns.filter(c => !c.hidden && !c.excludeFromExport && visibleColumns.includes(c.key)).map(c => c.label);
            const keys = columns.filter(c => !c.hidden && !c.excludeFromExport && visibleColumns.includes(c.key)).map(c => c.key);
            const maxCols = Math.max(headers.length, ...((exportExtraRows || []).map(r => r.length)));
            
            const exportData = processedData.map(row => {
                const rowData = {};
                keys.forEach((key, index) => {
                    let val = row[key];
                    
                    const colConfig = columns.find(c => c.key === key);
                    if (colConfig?.exportValue) {
                        val = colConfig.exportValue(row);
                    } else if (key === "Status" || key === "Active" || key === "IsActive" || typeof val === "boolean") {
                        val = (val === 1 || val === "1" || val === true || (typeof val === 'string' && val.toLowerCase() === 'true')) ? "Active" : "Inactive";
                    }
                    
                    if ((key === "Qty" || key === "Required_Manpower_Qty") && row.Units) {
                        val = `${val} ${row.Units}`;
                    }
                    rowData[headers[index]] = val !== null && val !== undefined ? String(val) : "";
                });
                return rowData;
            });

            const worksheet = XLSX.utils.aoa_to_sheet([[exportHeading]]);
            
            let currentOffset = 1;
            if (exportExtraRows && exportExtraRows.length > 0) {
                XLSX.utils.sheet_add_aoa(worksheet, exportExtraRows, { origin: { r: currentOffset, c: 0 } });
                currentOffset += exportExtraRows.length;
                currentOffset += 1;
            }
            
            XLSX.utils.sheet_add_json(worksheet, exportData, { origin: { r: currentOffset, c: 0 }, skipHeader: false });

            const borderStyle = {
                top: { style: 'thin', color: { rgb: "CBD5E1" } },
                bottom: { style: 'thin', color: { rgb: "CBD5E1" } },
                left: { style: 'thin', color: { rgb: "CBD5E1" } },
                right: { style: 'thin', color: { rgb: "CBD5E1" } }
            };

            for (let c = 0; c < maxCols; c++) {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: c });
                if (!worksheet[cellRef]) {
                    worksheet[cellRef] = { t: 's', v: '' };
                }
                worksheet[cellRef].s = {
                    font: { bold: true, sz: 16, color: { rgb: "065F46" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    fill: { fgColor: { rgb: "E6F4EA" } },
                    border: borderStyle
                };
            }

            if (exportExtraRows && exportExtraRows.length > 0) {
                exportExtraRows.forEach((row, rIdx) => {
                    const rowNum = 1 + rIdx;
                    row.forEach((val, cIdx) => {
                        const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: cIdx });
                        if (worksheet[cellRef]) {
                            const isLabel = cIdx % 2 === 0;
                            const isValue = cIdx % 2 === 1;
                            worksheet[cellRef].s = {
                                font: { 
                                    bold: isLabel || isValue, 
                                    color: { rgb: isLabel ? "475569" : "0284C7" },
                                    sz: 10
                                },
                                alignment: { 
                                    horizontal: isLabel ? "right" : "left", 
                                    vertical: "center" 
                                }
                            };
                        }
                    });
                });
            }

            const headerRowIndex = currentOffset;
            headers.forEach((_, colIndex) => {
                const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
                if (worksheet[cellRef]) {
                    worksheet[cellRef].s = {
                        font: { bold: true, color: { rgb: "065F46" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        fill: { fgColor: { rgb: "D1FAE5" } },
                        border: borderStyle
                    };
                }
            });

            const dataStartRowIndex = headerRowIndex + 1;
            exportData.forEach((_, rowIndex) => {
                const excelRowIndex = rowIndex + dataStartRowIndex; 
                const isAlternate = rowIndex % 2 !== 0;
                headers.forEach((_, colIndex) => {
                    const cellRef = XLSX.utils.encode_cell({ r: excelRowIndex, c: colIndex });
                    if (worksheet[cellRef]) {
                        worksheet[cellRef].s = {
                            alignment: { vertical: "center" },
                            fill: { fgColor: { rgb: isAlternate ? "F4FBF7" : "FFFFFF" } },
                            border: borderStyle
                        };
                    }
                });
            });

            if (headers.length > 0) {
                worksheet['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } }
                ];
                if(!worksheet['!rows']) worksheet['!rows'] = [];
                worksheet['!rows'][0] = { hpt: 35 };
                if (exportExtraRows && exportExtraRows.length > 0) {
                    exportExtraRows.forEach((_, rIdx) => {
                        worksheet['!rows'][1 + rIdx] = { hpt: 20 };
                    });
                    worksheet['!rows'][1 + exportExtraRows.length] = { hpt: 15 };
                }
                worksheet['!rows'][headerRowIndex] = { hpt: 25 };
            }

            const colWidths = Array.from({ length: maxCols }).map((_, colIndex) => {
                let max = 0;
                if (colIndex < headers.length) {
                    max = Math.max(max, headers[colIndex].length);
                }
                exportData.forEach(row => {
                    if (colIndex < headers.length) {
                        const val = row[headers[colIndex]];
                        if (val) max = Math.max(max, String(val).length);
                    }
                });
                if (exportExtraRows && exportExtraRows.length > 0) {
                    exportExtraRows.forEach(row => {
                        if (colIndex < row.length) {
                            const val = row[colIndex];
                            if (val) max = Math.max(max, String(val).length);
                        }
                    });
                }
                return { wch: max + 4 };
            });
            worksheet['!cols'] = colWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

            const today = new Date();
            const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getFullYear()}`;
            const baseName = exportFileName.replace('.xlsx', '');
            const finalFileName = `${baseName}_${dateStr}.xlsx`;

            XLSX.writeFile(workbook, finalFileName);
        } catch (error) {
            console.error("Export Error: ", error);
        } finally {
            setIsExporting(false);
        }
    };

    const clearAllFilters = () => {
        setGlobalFilter('');
        setColumnFilters({});
        setHeaderSearchValues([]);
        setSortConfig(null);
    };

    const hasActiveFilters = globalFilter || Object.keys(columnFilters).some(k => columnFilters[k].length > 0) || headerSearchValues.length > 0 || sortConfig;

    const handleSort = (key) => { if (key === "Proceed_to_Complete" || key === "checkbox") return; if (sortConfig?.key !== key) setSortConfig({ key, direction: 'descending' }); else if (sortConfig.direction === 'descending') setSortConfig({ key, direction: 'ascending' }); else setSortConfig(null); };
    const handleColumnFilterChange = (key, values) => { setColumnFilters(p => ({ ...p, [key]: values })); setPagination(p => ({ ...p, currentPage: 1 })); };

    const uniqueColumnValues = useMemo(() => {
        if (!headerSearchColumn) return [];
        return Array.from(new Set(data.map(r => String(r[headerSearchColumn] || '').trim()))).filter(Boolean).map(v => ({ label: v, value: v }));
    }, [headerSearchColumn, data]);

    const processedData = useMemo(() => {
        let processed = [...data];
        if (headerSearchValues.length) processed = processed.filter(i => headerSearchValues.includes(String(i[headerSearchColumn] || '')));
        if (globalFilter) processed = processed.filter(i => Object.values(i).some(v => String(v).toLowerCase().includes(globalFilter.toLowerCase())));
        const activeColFilters = Object.entries(columnFilters).filter(([, v]) => v.length > 0);
        if (activeColFilters.length > 0) processed = processed.filter(item => activeColFilters.every(([key, values]) => values.includes(String(item[key]))));
        if (sortConfig) processed.sort((a, b) => { 
            const valA = a[sortConfig.key] || ''; const valB = b[sortConfig.key] || ''; 
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1; 
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1; 
            return 0; 
        });
        return processed;
    }, [data, headerSearchValues, globalFilter, columnFilters, sortConfig, headerSearchColumn]);

    useEffect(() => {
        if (onFilteredDataChange) {
            onFilteredDataChange(processedData);
        }
    }, [processedData, onFilteredDataChange]);

    const limit = pagination.rowsPerPage === "All" ? processedData.length || 1 : pagination.rowsPerPage;
    const paginatedData = processedData.slice((pagination.currentPage - 1) * limit, pagination.currentPage * limit);
    const totalPages = Math.ceil(processedData.length / limit);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (globalFilter) count++;
        if (headerSearchValues.length > 0) count++;
        count += Object.values(columnFilters).filter(v => v.length > 0).length;
        return count;
    }, [globalFilter, headerSearchValues, columnFilters]);

    return (
        <div ref={containerRef} className="@container/main flex flex-col h-full w-full rounded-xl ">
            <div id="table-header" className="mb-2">
                <div className="flex flex-col md:flex-row items-center gap-2 p-1.5 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex-wrap shadow-sm">
                    <div className="w-full md:w-56 shrink-0">
                        <SingleSelectCombobox 
                            options={columns.filter(c => c.filterable && !c.hidden).map(c => ({ label: c.label, value: c.key }))} 
                            selected={headerSearchColumn} 
                            onSelectedChange={(v) => { setHeaderSearchColumn(v); setHeaderSearchValues([]); }} 
                            placeholder="Column..." 
                        />
                    </div>
                    <div className="w-full md:w-64 shrink-0">
                        <MultiSelectCombobox 
                            options={uniqueColumnValues} 
                            selected={headerSearchValues} 
                            onSelectedChange={setHeaderSearchValues} 
                            placeholder="Filter values..." 
                        />
                    </div>
                    <div className="relative w-full md:max-w-xs lg:max-w-sm grow">
                        <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <Input 
                            placeholder={searchPlaceholder} 
                            value={globalFilter} 
                            onChange={e => setGlobalFilter(e.target.value)} 
                            className="pl-9 h-8 text-xs w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg focus-visible:ring-1 focus-visible:ring-sky-500 transition-shadow" 
                        />
                    </div>
                    
                    <div className="flex items-center gap-1.5 w-full md:w-auto md:ml-auto justify-end flex-wrap">
                        <TooltipProvider delayDuration={200}>
                            {hasActiveFilters && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={clearAllFilters} 
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative cursor-pointer"
                                        >
                                            <RefreshCcw className="h-3.5 w-3.5" />
                                            {activeFilterCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-sky-500 rounded-full text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                                                    {activeFilterCount}
                                                </span>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">Clear Filters</TooltipContent>
                                </Tooltip>
                            )}
                            

                            
                            <Popover>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-block">
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="icon"
                                                    className="h-8 w-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                                                >
                                                    <LayoutTemplate className="h-3.5 w-3.5" />
                                                </Button>
                                            </PopoverTrigger>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">Toggle Columns</TooltipContent>
                                </Tooltip>
                                <PopoverContent className="w-48 p-2 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-md" align="end">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-[10px] tracking-wider uppercase mb-2 px-1.5 text-slate-400 dark:text-slate-500">Toggle Columns</h4>
                                        {columns.filter(c => !c.hidden).map(col => (
                                            <div 
                                                key={`toggle-${col.key}`} 
                                                className="flex items-center space-x-2 px-1.5 py-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer transition-colors" 
                                                onClick={() => setVisibleColumns(prev => prev.includes(col.key) ? prev.filter(k => k !== col.key) : [...prev, col.key])}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={visibleColumns.includes(col.key)} 
                                                    readOnly 
                                                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
                                                />
                                                <label className="text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">{col.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>

                            {!hideExport && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            size="icon"
                                            onClick={exportToExcel} 
                                            disabled={isExporting || processedData.length === 0} 
                                            className="h-8 w-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-xs">Export Excel</TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            <div className={cn(
                "overflow-x-auto overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-md grow shadow-xs flex-1 h-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 w-full max-w-full block",
                maxHeight
            )}>
                <table className="w-full text-xs border-collapse min-w-max">
                    <thead className="sticky top-0 z-10 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md">
                        <tr>
                            <th className="border-b border-slate-300 dark:border-slate-700 px-3 py-2 text-left w-12 text-slate-600 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase">#</th>
                            {columns.filter(c => !c.hidden && visibleColumns.includes(c.key)).map(col => (
                                <th 
                                    key={col.key} 
                                    className={cn("border-b border-slate-300 dark:border-slate-700 px-3 py-2 text-left font-bold cursor-pointer select-none text-slate-600 dark:text-slate-400 text-[10px] tracking-wider uppercase hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors whitespace-nowrap", col.className)} 
                                    onClick={() => handleSort(col.key)}
                                >
                                    <div className={cn(
                                        "flex items-center gap-1",
                                        col.className?.includes("text-center") && "justify-center",
                                        col.className?.includes("text-right") && "justify-end"
                                    )}>
                                        {col.label}
                                        {sortConfig?.key === col.key && (sortConfig.direction === 'descending' ? <ArrowDown className="h-3 w-3 text-slate-500" /> : <ArrowUp className="h-3 w-3 text-slate-500" />)}
                                        {col.filterable && <ColumnFilterPopover column={col} data={data} activeFilters={columnFilters} onFilterChange={handleColumnFilterChange} />}
                                    </div>
                                </th>
                            ))}
                            {actionColumn && <th className="border-b border-slate-300 dark:border-slate-700 px-2 py-2 text-center w-12 text-slate-600 dark:text-slate-400 font-bold text-[10px] tracking-wider uppercase sticky right-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md z-20 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className="border-b border-slate-200 dark:border-slate-800/60">
                                    <td className="px-2 py-2"><div className="h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-6"></div></td>
                                    {columns.filter(c => !c.hidden && visibleColumns.includes(c.key)).map((col, cIdx) => (
                                        <td key={`skel-col-${col.key}`} className="px-2 py-2">
                                            <div className={cn("h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-full", cIdx % 2 === 0 ? "max-w-28" : "max-w-20")}></div>
                                        </td>
                                    ))}
                                    {actionColumn && <td className="px-2 py-2 sticky right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-10"><div className="h-3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded w-8 mx-auto"></div></td>}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.filter(c => !c.hidden && visibleColumns.includes(c.key)).length + (actionColumn ? 2 : 1)}>
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 shadow-inner border border-slate-100 dark:border-slate-800">
                                            <EmptyStateIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{emptyStateTitle}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{emptyStateDescription}</p>
                                        {emptyStateAction && <div className="mt-4">{emptyStateAction}</div>}
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.map((row, i) => {
                            const isAlternate = i % 2 !== 0;
                            return (
                                <tr 
                                    key={i} 
                                    className={cn(
                                        "border-b border-slate-400 dark:border-slate-500 cursor-pointer transition-all duration-200",
                                        "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 hover:-translate-y-px hover:shadow-sm relative z-0 hover:z-10 group",
                                        isAlternate ? "bg-transparent" : "bg-transparent",
                                        rowClassName ? rowClassName(row) : ""
                                    )} 
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    <td className="border-b border-slate-100 dark:border-slate-800/60 px-3 py-2 text-slate-400 dark:text-slate-500 font-semibold">{((pagination.currentPage - 1) * limit) + i + 1}</td>
                                    {columns.filter(c => !c.hidden && visibleColumns.includes(c.key)).map(col => {
                                        const titleText = (typeof row[col.key] === 'string' || typeof row[col.key] === 'number') ? String(row[col.key]) : undefined;
                                        return (
                                            <td key={col.key} title={titleText} className={cn("border-b border-slate-100 dark:border-slate-800/60 px-3 py-2 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium", col.className)}>
                                                {renderCell ? renderCell(row, col) : (col.cell ? col.cell({ row: { original: row } }) : row[col.key])}
                                            </td>
                                        );
                                    })}
                                    {actionColumn && <td className="border-b border-slate-100 dark:border-slate-800/60 px-2 py-2 text-center sticky right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-10 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/90 dark:group-hover:bg-slate-900/90" onClick={e => e.stopPropagation()}>{actionColumn(row)}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

            </div>

            <div id="table-footer" className="py-2.5 px-1.5 flex flex-col md:flex-row items-center justify-between gap-4 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Rows per page:</span>
                    <select 
                        value={pagination.rowsPerPage} 
                        onChange={(e) => setPagination({ currentPage: 1, rowsPerPage: e.target.value === "All" ? "All" : Number(e.target.value) })} 
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1 px-2 h-7 text-xs font-medium focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                        {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                        <option value="All">All</option>
                    </select>
                </div>
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {processedData.length === 0 ? 0 : ((pagination.currentPage - 1) * limit) + 1}-{Math.min(pagination.currentPage * limit, processedData.length)} of {processedData.length}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400" onClick={() => setPagination(p => ({ ...p, currentPage: 1 }))} disabled={pagination.currentPage === 1}>«</Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400" onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))} disabled={pagination.currentPage === 1}>‹</Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400" onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))} disabled={pagination.currentPage === totalPages}>›</Button>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400" onClick={() => setPagination(p => ({ ...p, currentPage: totalPages }))} disabled={pagination.currentPage === totalPages}>»</Button>
                </div>
            </div>
        </div>
    );
}
