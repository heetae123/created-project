import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

interface CustomCalendarProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
}

export default function CustomCalendar({ selected, onSelect, placeholder = '날짜 선택' }: CustomCalendarProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selected || new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; date: Date }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false, date: new Date(year, month + 1, i) });
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const isToday = (d: Date) => isSameDay(d, new Date());

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSelect = (date: Date) => {
    onSelect(date);
    setOpen(false);
  };

  const formatDate = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] text-sm font-bold transition-all text-left flex items-center justify-between ${
          !selected ? 'text-zinc-600' : 'text-zinc-100'
        }`}
      >
        {selected ? formatDate(selected) : placeholder}
        <CalendarDays className="w-4 h-4 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-700 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </button>
            <span className="text-sm font-black text-zinc-100">
              {year}년 {MONTHS[month]}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-bold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, idx) => {
              const isSelected = selected && isSameDay(cell.date, selected);
              const today = isToday(cell.date);
              const dayOfWeek = cell.date.getDay();

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(cell.date)}
                  className={`h-9 w-full rounded-lg text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20'
                      : today
                        ? 'bg-zinc-700 text-zinc-100 font-black'
                        : cell.current
                          ? dayOfWeek === 0
                            ? 'text-red-400 hover:bg-zinc-800'
                            : dayOfWeek === 6
                              ? 'text-blue-400 hover:bg-zinc-800'
                              : 'text-zinc-100 hover:bg-zinc-800'
                          : 'text-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-center">
            <button
              type="button"
              onClick={() => { setViewDate(new Date()); handleSelect(new Date()); }}
              className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] transition-colors"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
