import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { DateTimePicker } from "../../components/ui/date-time-picker";
import { FieldLabel, Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  EMPTY_SELECT_VALUE,
  selectValue,
  type SelectOption,
} from "./utils/cars-filter-utils";
import type { CarFilters } from "./types";
import { minimumAdvanceBookingHours } from "./constants";

type CarsFilterPanelProps = {
  draftFilters: CarFilters;
  filterOptions: {
    countries: SelectOption[];
    cities: SelectOption[];
    categories: SelectOption[];
    transmissions: SelectOption[];
    seats: SelectOption[];
  };
  pendingFilterCount: number;
  errorMessage: string;
  onChange: (name: keyof CarFilters, value: string) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function renderSelectItems(items: SelectOption[]) {
  return items.map((item) => (
    <SelectItem key={item.value} value={item.value}>
      {item.label}
    </SelectItem>
  ));
}

export function CarsFilterPanel({
  draftFilters,
  filterOptions,
  pendingFilterCount,
  errorMessage,
  onChange,
  onReset,
  onSubmit,
}: CarsFilterPanelProps) {
  const [minimumPickupAt] = useState(
    () => new Date(Date.now() + minimumAdvanceBookingHours * 60 * 60 * 1000),
  );

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-12 gap-3.5">
            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Country</FieldLabel>
              <Select
                value={selectValue(draftFilters.countryCode)}
                onValueChange={(value) => onChange("countryCode", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    All destinations
                  </SelectItem>
                  {renderSelectItems(filterOptions.countries)}
                </SelectContent>
              </Select>
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>City</FieldLabel>
              <Select
                value={selectValue(draftFilters.city)}
                onValueChange={(value) => onChange("city", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>All cities</SelectItem>
                  {renderSelectItems(filterOptions.cities)}
                </SelectContent>
              </Select>
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Category</FieldLabel>
              <Select
                value={selectValue(draftFilters.category)}
                onValueChange={(value) => onChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    All categories
                  </SelectItem>
                  {renderSelectItems(filterOptions.categories)}
                </SelectContent>
              </Select>
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Transmission</FieldLabel>
              <Select
                value={selectValue(draftFilters.transmission)}
                onValueChange={(value) => onChange("transmission", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All transmissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>
                    All transmissions
                  </SelectItem>
                  {renderSelectItems(filterOptions.transmissions)}
                </SelectContent>
              </Select>
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Seats</FieldLabel>
              <Select
                value={selectValue(draftFilters.seats)}
                onValueChange={(value) => onChange("seats", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPTY_SELECT_VALUE}>Any size</SelectItem>
                  {renderSelectItems(filterOptions.seats)}
                </SelectContent>
              </Select>
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Pickup</FieldLabel>
              <DateTimePicker
                value={draftFilters.pickupAt}
                onChange={(value) => onChange("pickupAt", value)}
                placeholder="Pick pickup date"
                minDateTime={minimumPickupAt}
                minuteStep={30}
              />
            </Label>

            <Label className="col-span-12 md:col-span-6 xl:col-span-3">
              <FieldLabel>Return</FieldLabel>
              <DateTimePicker
                value={draftFilters.returnAt}
                onChange={(value) => onChange("returnAt", value)}
                placeholder="Pick return date"
                minDateTime={
                  draftFilters.pickupAt
                    ? new Date(draftFilters.pickupAt)
                    : minimumPickupAt
                }
                minDateTimeExclusive={Boolean(draftFilters.pickupAt)}
                minuteStep={30}
              />
            </Label>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2 text-[0.9rem] text-stone-500">
              <span>{pendingFilterCount} filters selected</span>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
              <Button type="submit">
                <Search className="size-4" />
                Search
              </Button>
            </div>
          </div>

          {errorMessage ? (
            <Alert className="mt-3" title="Search needs dates">
              {errorMessage}
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
