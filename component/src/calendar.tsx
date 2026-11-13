import { IqujiIcon } from "@iquji-web/web-icons";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { classNames } from "./utils.js";

export type IqujiCalendarProps = {
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onChange?: ((date: string) => void) | undefined;
  onClear?: (() => void) | undefined;
  min?: string | undefined;
  max?: string | undefined;
  disabledDate?: ((date: Date) => boolean) | undefined;
  clearable?: boolean | undefined;
  showToday?: boolean | undefined;
  className?: string | undefined;
  locale?: string | undefined;
  footer?: ReactNode | undefined;
};

export type CalendarDay = {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
};

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export function formatCalendarDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseCalendarDate(str?: string | null): Date | null {
  if (!str) return null;
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/u.exec(str.trim());
  if (!match) return null;
  const year = Number.parseInt(match[1] ?? "", 10);
  const month = Number.parseInt(match[2] ?? "", 10) - 1;
  const day = Number.parseInt(match[3] ?? "", 10);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

const WEEKDAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;
const WEEKDAY_NAMES_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function IqujiCalendar({
  className,
  clearable = true,
  defaultValue,
  disabledDate,
  footer,
  locale = "zh-CN",
  max,
  min,
  onChange,
  onClear,
  showToday = true,
  value,
}: IqujiCalendarProps) {
  const isZh = locale.startsWith("zh");
  const weekdays = isZh ? WEEKDAY_NAMES_ZH : WEEKDAY_NAMES_EN;

  const initialDate = useMemo(() => {
    return parseCalendarDate(value ?? defaultValue) ?? new Date();
  }, [value, defaultValue]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  const todayString = useMemo(() => formatCalendarDate(new Date()), []);
  const selectedDateString = useMemo(() => {
    if (value !== undefined) {
      return value;
    }
    return defaultValue ?? null;
  }, [value, defaultValue]);

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const days: CalendarDay[] = [];
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Days from previous month
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNumber = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNumber);
      const dateString = formatCalendarDate(prevDate);
      const isDateDisabled =
        Boolean(min && dateString < min) ||
        Boolean(max && dateString > max) ||
        Boolean(disabledDate?.(prevDate));
      days.push({
        date: prevDate,
        dateString,
        dayNumber,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isSelected: dateString === selectedDateString,
        isDisabled: isDateDisabled,
      });
    }

    // Days in current month
    for (let dayNumber = 1; dayNumber <= daysInCurrentMonth; dayNumber++) {
      const currentDate = new Date(viewYear, viewMonth, dayNumber);
      const dateString = formatCalendarDate(currentDate);
      const isDateDisabled =
        Boolean(min && dateString < min) ||
        Boolean(max && dateString > max) ||
        Boolean(disabledDate?.(currentDate));
      days.push({
        date: currentDate,
        dateString,
        dayNumber,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        isSelected: dateString === selectedDateString,
        isDisabled: isDateDisabled,
      });
    }

    // Days from next month (fill up to 42 cells)
    const remainingDays = 42 - days.length;
    for (let dayNumber = 1; dayNumber <= remainingDays; dayNumber++) {
      const nextDate = new Date(viewYear, viewMonth + 1, dayNumber);
      const dateString = formatCalendarDate(nextDate);
      const isDateDisabled =
        Boolean(min && dateString < min) ||
        Boolean(max && dateString > max) ||
        Boolean(disabledDate?.(nextDate));
      days.push({
        date: nextDate,
        dateString,
        dayNumber,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isSelected: dateString === selectedDateString,
        isDisabled: isDateDisabled,
      });
    }

    return days;
  }, [
    viewYear,
    viewMonth,
    min,
    max,
    disabledDate,
    todayString,
    selectedDateString,
  ]);

  const handlePrevYear = useCallback(() => {
    setViewYear((prev) => prev - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setViewYear((prev) => prev + 1);
  }, []);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const handleSelectDay = useCallback(
    (day: CalendarDay) => {
      if (day.isDisabled) return;
      if (!day.isCurrentMonth) {
        setViewYear(day.date.getFullYear());
        setViewMonth(day.date.getMonth());
      }
      onChange?.(day.dateString);
    },
    [onChange],
  );

  const handleToday = useCallback(() => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange?.(formatCalendarDate(today));
  }, [onChange]);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  const titleText = isZh
    ? `${viewYear} 年 ${viewMonth + 1} 月`
    : new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
      }).format(new Date(viewYear, viewMonth, 1));
  const calendarWeeks = Array.from(
    { length: Math.ceil(calendarDays.length / 7) },
    (_, index) => calendarDays.slice(index * 7, index * 7 + 7),
  );

  return (
    <section
      aria-label={titleText}
      className={classNames("iquji-calendar", className)}
    >
      <div className="iquji-calendar__header">
        <div className="iquji-calendar__nav">
          <button
            aria-label={isZh ? "上一年" : "Previous year"}
            className="iquji-calendar__nav-btn"
            onClick={handlePrevYear}
            type="button"
          >
            <IqujiIcon decorative name="chevrons-left" size={14} />
          </button>
          <button
            aria-label={isZh ? "上一月" : "Previous month"}
            className="iquji-calendar__nav-btn"
            onClick={handlePrevMonth}
            type="button"
          >
            <IqujiIcon decorative name="chevron-left" size={14} />
          </button>
        </div>
        <span className="iquji-calendar__title">{titleText}</span>
        <div className="iquji-calendar__nav">
          <button
            aria-label={isZh ? "下一月" : "Next month"}
            className="iquji-calendar__nav-btn"
            onClick={handleNextMonth}
            type="button"
          >
            <IqujiIcon decorative name="chevron-right" size={14} />
          </button>
          <button
            aria-label={isZh ? "下一年" : "Next year"}
            className="iquji-calendar__nav-btn"
            onClick={handleNextYear}
            type="button"
          >
            <IqujiIcon decorative name="chevrons-right" size={14} />
          </button>
        </div>
      </div>

      <table
        aria-label={isZh ? "日期" : "Dates"}
        className="iquji-calendar__table"
      >
        <thead>
          <tr className="iquji-calendar__weekdays">
            {weekdays.map((name) => (
              <th className="iquji-calendar__weekday" key={name} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="iquji-calendar__body">
          {calendarWeeks.map((week) => (
            <tr className="iquji-calendar__grid" key={week[0]?.dateString}>
              {week.map((day) => {
                const names = classNames(
                  "iquji-calendar__cell",
                  !day.isCurrentMonth
                    ? "iquji-calendar__cell--outside"
                    : undefined,
                  day.isToday ? "iquji-calendar__cell--today" : undefined,
                  day.isSelected ? "iquji-calendar__cell--selected" : undefined,
                  day.isDisabled ? "iquji-calendar__cell--disabled" : undefined,
                );
                return (
                  <td className="iquji-calendar__day" key={day.dateString}>
                    <button
                      aria-label={day.dateString}
                      aria-pressed={day.isSelected}
                      className={names}
                      disabled={day.isDisabled}
                      onClick={() => handleSelectDay(day)}
                      tabIndex={day.isCurrentMonth ? 0 : -1}
                      type="button"
                    >
                      {day.dayNumber}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {(showToday || (clearable && selectedDateString) || footer) && (
        <div className="iquji-calendar__footer">
          {showToday && (
            <button
              className="iquji-calendar__footer-btn"
              onClick={handleToday}
              type="button"
            >
              {isZh ? "今天" : "Today"}
            </button>
          )}
          {clearable && Boolean(selectedDateString) && (
            <button
              className="iquji-calendar__footer-btn iquji-calendar__footer-btn--clear"
              onClick={handleClear}
              type="button"
            >
              {isZh ? "清除" : "Clear"}
            </button>
          )}
          {footer}
        </div>
      )}
    </section>
  );
}
