"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    FolderKanban,
    SlidersHorizontal,
} from "lucide-react";

export default function Filters({
                                    filterType,
                                    setFilterType,
                                    datePreset,
                                    setDatePreset,
                                    rangeStart,
                                    setRangeStart,
                                    rangeEnd,
                                    setRangeEnd,
                                    selectedCategory,
                                    setSelectedCategory,
                                    categories,
                                }: any) {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="space-y-4 rounded-2xl border border-border/50 bg-background/80 p-3 sm:p-4">

            {/* =========================
          TYPE + CATEGORY (ALWAYS)
      ========================== */}
            <div className="flex flex-wrap gap-2 items-center">

                {/* Type */}
                {(["ALL", "IN", "OUT"] as const).map((type) => (
                    <Button
                        key={type}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setFilterType(type)}
                        className={`rounded-full text-xs sm:text-sm gap-1.5 ${
                            filterType === type
                                ? "bg-primary text-primary-foreground"
                                : ""
                        }`}
                    >
                        {type === "IN" && <ArrowDownRight className="h-3.5 w-3.5" />}
                        {type === "OUT" && <ArrowUpRight className="h-3.5 w-3.5" />}
                        {type}
                    </Button>
                ))}

                {/* Category */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 w-full sm:w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All categories</SelectItem>
                            {categories.map((c: string) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* More button (mobile only) */}
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="lg:hidden ml-auto"
                    onClick={() => setShowMore((p) => !p)}
                >
                    <SlidersHorizontal className="h-4 w-4 mr-1" />
                    More
                </Button>
            </div>

            {/* =========================
          DESKTOP ONLY FILTERS
      ========================== */}
            <div className="hidden lg:flex flex-wrap gap-2">

                {([
                    ["ALL", "All"],
                    ["TODAY", "Today"],
                    ["YESTERDAY", "Yesterday"],
                    ["THIS_MONTH", "Month"],
                    ["LAST_7_DAYS", "7d"],
                    ["CUSTOM", "Custom"],
                ] as const).map(([preset, label]) => (
                    <Button
                        key={preset}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDatePreset(preset)}
                        className={`rounded-full text-xs sm:text-sm gap-1.5 ${
                            datePreset === preset
                                ? "bg-primary/10 text-primary border-primary/30"
                                : ""
                        }`}
                    >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {label}
                    </Button>
                ))}
            </div>

            {/* =========================
          MOBILE EXPANDABLE FILTERS
      ========================== */}
            {showMore && (
                <div className="lg:hidden space-y-3 pt-2 border-t border-border/40">

                    {/* Date presets */}
                    <div className="flex flex-wrap gap-2">
                        {([
                            ["ALL", "All"],
                            ["TODAY", "Today"],
                            ["YESTERDAY", "Yesterday"],
                            ["THIS_MONTH", "Month"],
                            ["LAST_7_DAYS", "7d"],
                            ["CUSTOM", "Custom"],
                        ] as const).map(([preset, label]) => (
                            <Button
                                key={preset}
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setDatePreset(preset)}
                                className={`rounded-full text-xs gap-1.5 ${
                                    datePreset === preset
                                        ? "bg-primary/10 text-primary"
                                        : ""
                                }`}
                            >
                                <CalendarDays className="h-3.5 w-3.5" />
                                {label}
                            </Button>
                        ))}
                    </div>

                    {/* Custom range */}
                    {datePreset === "CUSTOM" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={rangeStart}
                                onChange={(e) => setRangeStart(e.target.value)}
                            />
                            <Input
                                type="date"
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}