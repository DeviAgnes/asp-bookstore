import { PaymentMethod } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  const nameParts = name.split(/[^a-zA-Z]+/);
  let initials = "";

  for (const part of nameParts) {
    if (part.length > 0) {
      initials += part[0];
    }

    if (initials.length >= 2) {
      break;
    }
  }

  return initials.toUpperCase();
}

export const extractShortId = (id: string) => {
  return id.slice(-6).toUpperCase();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const paymentMethodToLabel = {
  credit_card: PaymentMethod.credit_card,
  debit_card: PaymentMethod.debit_card,
} satisfies Record<PaymentMethod, string>;

export const convertTimeToDate = (time: string) => {
  const currentDate = new Date();
  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes,
  );

  return date;
};

export const convertDateToTime = (date: Date | string) => {
  let _date: Date;
  if (typeof date === "string") {
    _date = new Date(date);
  } else {
    _date = date;
  }

  return `${_date.getHours()}:${_date.getMinutes()}`;
};

export function convertScheduleTimeToDate(time: {
  endTime: string;
  startTime: string;
}): {
  endDate: Date;
  startDate: Date;
} {
  const startDate = convertTimeToDate(time.startTime);
  const endDate = convertTimeToDate(time.endTime);

  // Adjust endDate to the next day if endTime is past midnight (after startTime)
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { startDate, endDate };
}

export const formatDate = (date: Date | string) => {
  let _date: Date;
  if (typeof date === "string") {
    _date = new Date(date);
  } else {
    _date = date;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(_date);
};

export const formatTime = (time: Date | string) => {
  let _time: Date;
  if (typeof time === "string") {
    _time = new Date(time);
  } else {
    _time = time;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(_time);
};

export const BookingState = {
  Past: "Past",
  Min30MinutesLeft: "Min30MinutesLeft",
  Ongoing: "Ongoing",
  Future: "Future",
} as const;

export type BookingState = (typeof BookingState)[keyof typeof BookingState];

export const bookingStateToLabel = {
  Past: "Past",
  Min30MinutesLeft: "Extension Possible",
  Ongoing: "Ongoing",
  Future: "Future",
} satisfies Record<BookingState, string>;

export function toHHMM(date: Date | string): string {
  let _date: Date;
  if (typeof date === "string") {
    _date = new Date(date);
  } else {
    _date = date;
  }

  const hours = _date.getHours().toString().padStart(2, "0");
  const minutes = _date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
