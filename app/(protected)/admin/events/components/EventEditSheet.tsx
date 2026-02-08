"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as React from "react";
import { Controller } from "react-hook-form";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EventFormValues, eventSchema } from "../schema/eventForm.schema";
import { Separator } from "@/components/ui/separator";
import { IMaskInput } from "react-imask";
import { DateTime } from "luxon";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  mode: "create" | "update";
  onOpenChange: (open: boolean) => void;
  defaultValues?: EventFormValues;
  onSubmit: (payload: EventFormValues) => void;
  isSubmitting?: boolean;
};

export function EventEditSheet({ open, onOpenChange, defaultValues, onSubmit, mode, isSubmitting }: Props) {
  const [openDate, setOpenDate] = React.useState(false);

  const emptyValues: EventFormValues = {
    title: "",
    description: "",
    date: DateTime.now(),
    day: "Monday",
    time: "10:30",
    phone: "",
    is_active: true,
    is_featured: false,
    is_recurring: false,
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: emptyValues,
  });

  const { watch } = form;

  React.useEffect(() => {
    if (open) {
      if (mode === "create") form.reset(emptyValues);
      else if (mode === "update" && defaultValues) form.reset(defaultValues);
    }
  }, [open, mode, defaultValues]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-neutral-950 rounded-lg m-4 border border-neutral-800">
        <SheetHeader>
          <SheetTitle className="text-2xl">{mode === "create" ? "Create Event" : "Edit Event"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new event to the calendar."
              : "Make changes to the event details and save your changes."}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 flex flex-col gap-3 h-full">
          <div>
            <Label>Title</Label>
            <Input {...form.register("title")} className="border-neutral-800 text-white bg-neutral-900" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea {...form.register("description")} className="border-neutral-800 text-white bg-neutral-900" />
          </div>

          <Controller
            control={form.control}
            name="phone"
            render={({ field }) => (
              <div>
                <Label>Phone</Label>
                <IMaskInput
                  mask="(000) 000-0000"
                  value={field.value}
                  onAccept={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  placeholder="(416) 778-0014"
                  className="h-9 px-3 py-5 w-full rounded-md border border-neutral-800 text-white bg-neutral-900"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
            )}
          />

          <div className="border rounded-xl border-neutral-800 p-4 my-3">
            <div className="flex items-center justify-between">
              <Label>Recurring</Label>
              <Switch checked={form.watch("is_recurring")} onCheckedChange={(v) => form.setValue("is_recurring", v)} />
            </div>
            <Separator className="my-4 bg-neutral-800" />
            <div className="grid grid-cols-2 gap-2">
              {watch("is_recurring") ? (
                <div>
                  <Controller
                    control={form.control}
                    name="day"
                    render={({ field }) => (
                      <div>
                        <Label>Day</Label>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full border-neutral-800 text-white bg-neutral-900">
                            <SelectValue placeholder="Select a day" />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-900 border border-neutral-800">
                            <SelectGroup>
                              <SelectLabel>Days</SelectLabel>
                              <SelectItem value="Monday">Monday</SelectItem>
                              <SelectItem value="Tuesday">Tuesday</SelectItem>
                              <SelectItem value="Wednesday">Wednesday</SelectItem>
                              <SelectItem value="Thursday">Thursday</SelectItem>
                              <SelectItem value="Friday">Friday</SelectItem>
                              <SelectItem value="Saturday">Saturday</SelectItem>
                              <SelectItem value="Sunday">Sunday</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                </div>
              ) : (
                <Controller
                  control={form.control}
                  name="date"
                  render={({ field }) => {
                    const dateValue = field.value as unknown as DateTime;
                    return (
                      <div>
                        <Label>Date</Label>
                        <Popover open={openDate} onOpenChange={setOpenDate}>
                          <PopoverTrigger asChild>
                            <Button size={"md"} variant="dashboard" className="w-full justify-between">
                              {dateValue?.toFormat ? dateValue.toFormat("dd-MM-yyyy") : "Tarih Seçin"}
                              {/*field.value.toFormat("dd-MM-yyyy")*/}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateValue?.toJSDate ? dateValue.toJSDate() : undefined}
                              onSelect={(date) => {
                                field.onChange(DateTime.fromJSDate(date!));
                                setOpenDate(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    );
                  }}
                />
              )}
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  step="1"
                  defaultValue="10:30:00"
                  className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none border-neutral-800 text-white bg-neutral-900 flex text-center px-3 h-11"
                  {...form.register("time")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={form.watch("is_active")} onCheckedChange={(v) => form.setValue("is_active", v)} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Featured</Label>
            <Switch checked={form.watch("is_featured")} onCheckedChange={(v) => form.setValue("is_featured", v)} />
          </div>

          <div className="pt-4 flex flex-col gap-3 mt-auto mb-4">
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="rounded-md bg-red-900/10 border border-red-900/70 p-4 mb-4">
                <h3 className="font-medium text-neutral-50">
                  Please fix {Object.keys(form.formState.errors).length} error(s):
                </h3>
                <ul className="mt-2 text-sm text-neutral-50 list-disc list-inside">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>{error?.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
