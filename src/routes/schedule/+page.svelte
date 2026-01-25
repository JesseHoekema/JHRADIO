<script lang="ts">
  import type { CalendarOptions } from "svelte-fullcalendar";
  import { onMount, tick } from "svelte";
  import { fetchScheduleWeek } from "$lib/azura";
  import FullCalendar from "svelte-fullcalendar";
  import daygridPlugin from "@fullcalendar/daygrid";
  import timeGridPlugin from "@fullcalendar/timegrid";
  import MenuButton from "$lib/components/MenuButton.svelte";

  export const data = $props();

  const HOUR_HEIGHT = 74;
  const MINUTE_PX = HOUR_HEIGHT / 60;
  const DAY_BODY_HEIGHT = 24 * HOUR_HEIGHT;

  let referenceDate = new Date();
  let weekStart: Date;
  let weekEnd: Date;
  let days = $state<{ date: Date; label: string; key: number }[]>([]);
  type EventItem = {
    id: string;
    title: string;
    description?: string;
    top: number;
    height: number;
    startLabel: string;
    endLabel: string;
  };
  let eventsByDay = $state<Record<number, EventItem[]>>({});
  let title = $state("");
  let loading = $state(false);
  let isMobile = $state(false);

  function formatRange(start: Date, end: Date) {
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return `${start.toLocaleDateString(undefined, opts)} - ${end.toLocaleDateString(undefined, opts)}`;
  }
  function getWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  function getDay(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  function buildDays(start: Date) {
    const arr = [] as { date: Date; label: string; key: number }[];
    const count = isMobile ? 1 : 7;
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const label = d.toLocaleDateString("en-US", { weekday: "long" });
      arr.push({ date: d, label, key: i });
    }
    return arr;
  }

  function formatDate(date: Date) {
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  }
  function isToday(d: Date) {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  function formatHour(h: number) {
    return `${String(h).padStart(2, "0")}:00`;
  }

  async function load() {
    loading = true;
    const { start, end } = isMobile
      ? getDay(referenceDate)
      : getWeek(referenceDate);
    weekStart = start;
    weekEnd = end;
    days = isMobile ? buildDays(weekStart) : buildDays(weekStart);
    title = isMobile
      ? formatDate(referenceDate)
      : formatRange(weekStart, weekEnd);

    const weekStartTime = start.getTime();
    const weekEndTime = end.getTime();

    try {
      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const schedule = await fetchScheduleWeek(startISO, endISO);
      const newEventsByDay: Record<number, EventItem[]> = {};

      schedule.forEach((entry: any) => {
        let s: Date, e: Date;
        if (entry.start_timestamp) {
          s = new Date(entry.start_timestamp * 1000);
        } else if (entry.start) {
          s = new Date(entry.start);
        } else {
          return;
        }

        if (entry.end_timestamp) {
          e = new Date(entry.end_timestamp * 1000);
        } else if (entry.end) {
          e = new Date(entry.end);
        } else {
          return;
        }

        if (s.getTime() < weekEndTime && e.getTime() > weekStartTime) {
          for (let i = 0; i < days.length; i++) {
            const dayStart = new Date(days[i].date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(days[i].date);
            dayEnd.setHours(23, 59, 59, 999);
            if (
              s.getTime() < dayEnd.getTime() &&
              e.getTime() > dayStart.getTime()
            ) {
              const visibleStart =
                s.getTime() < dayStart.getTime() ? dayStart : s;
              const visibleEnd = e.getTime() > dayEnd.getTime() ? dayEnd : e;
              const EVENT_GAP = 2;
              const top =
                (visibleStart.getHours() * 60 + visibleStart.getMinutes()) *
                  MINUTE_PX +
                EVENT_GAP;
              const height = Math.max(
                30,
                ((visibleEnd.getTime() - visibleStart.getTime()) / 60000) *
                  MINUTE_PX -
                  EVENT_GAP * 2,
              );
              const startLabel = visibleStart.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              const endLabel = visibleEnd.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              const item = {
                id: `${entry.id || entry.start_timestamp}-${i}`,
                title: entry.name || entry.title || "Untitled",
                description: entry.description,
                top,
                height,
                startLabel,
                endLabel,
              };
              (newEventsByDay[i] ??= []).push(item);
            }
          }
        }
      });

      eventsByDay = newEventsByDay;
    } catch (error) {
      console.error("Failed to load schedule:", error);
    }

    loading = false;
  }

  async function prev() {
    const daysToMove = isMobile ? 1 : 7;
    referenceDate.setDate(referenceDate.getDate() - daysToMove);
    await load();
  }
  async function next() {
    const daysToMove = isMobile ? 1 : 7;
    referenceDate.setDate(referenceDate.getDate() + daysToMove);
    await load();
  }
  async function today() {
    referenceDate = new Date();
    await load();
    await scrollToCurrentTime();
  }

  const hours = Array.from({ length: 24 }, (_, h) => h);

  let currentTimePosition = $state(0);

  function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    currentTimePosition = (hours * 60 + minutes) * MINUTE_PX;
  }

  function isCurrentDay(dayIndex: number) {
    const day = days[dayIndex];
    if (!day) return false;
    if (isMobile) {
      return (
        day.date.getFullYear() === referenceDate.getFullYear() &&
        day.date.getMonth() === referenceDate.getMonth() &&
        day.date.getDate() === referenceDate.getDate()
      );
    }
    return isToday(day.date);
  }

  function isDisplayedDay(day: { date: Date; label: string; key: number }) {
    if (isMobile) {
      return (
        day.date.getFullYear() === referenceDate.getFullYear() &&
        day.date.getMonth() === referenceDate.getMonth() &&
        day.date.getDate() === referenceDate.getDate()
      );
    }
    return isToday(day.date);
  }

  function isCurrentWeek() {
    if (!weekStart || !weekEnd) return false;
    const now = new Date();
    if (isMobile) {
      return isToday(referenceDate);
    }
    return now >= weekStart && now <= weekEnd;
  }

  let scrollContainer: HTMLDivElement | null = $state(null);

  async function scrollToCurrentTime() {
    if (!scrollContainer || !isCurrentWeek()) return;
    await tick();
    updateCurrentTime();
    const headerHeight = 52;
    const scrollPosition =
      currentTimePosition + headerHeight - scrollContainer.clientHeight / 2;
    scrollContainer.scrollTop = Math.max(0, scrollPosition);
  }

  function checkMobile() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 640;
    if (wasMobile !== isMobile && !loading) {
      load();
    }
  }
  function openShow(title: string) {
    alert(`Show details for "${title}" would open here.`);
  }

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);

    (async () => {
      await load();
      await scrollToCurrentTime();
      updateCurrentTime();
    })();

    const interval = setInterval(updateCurrentTime, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", checkMobile);
    };
  });
</script>

<div class="calendar-page">
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="nav-btn" onclick={prev} aria-label="Previous week">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <MenuButton />
    </div>
    <div class="title">{title}</div>
    <div class="toolbar-right">
      <button
        class="nav-btn today-btn"
        onclick={today}
        aria-label="Go to today"
      >
        Today
      </button>
      <button class="nav-btn" onclick={next} aria-label="Next week">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>

  <div class="calendar-wrapper">
    <div class="calendar-scroll" bind:this={scrollContainer}>
      <div class="time-gutter">
        <div class="gutter-spacer"></div>
        {#each hours as h}
          <div class="gutter-hour" style={`height:${HOUR_HEIGHT}px`}>
            {formatHour(h)}
          </div>
        {/each}
      </div>

      <div class="days-container">
        <div class="days-header">
          {#each days as day, i}
            <div class={`day-header ${isDisplayedDay(day) ? "current" : ""}`}>
              <div class="day-name">{day.label}</div>
              <div class="day-date">{formatDate(day.date)}</div>
            </div>
          {/each}
        </div>

        <div class="days-grid">
          {#each days as day, i}
            <div class={`day ${isDisplayedDay(day) ? "current" : ""}`}>
              <div class="day-body" style={`height:${DAY_BODY_HEIGHT}px`}>
                {#each hours as h}
                  <div
                    class="hour-line"
                    style={`top:${h * HOUR_HEIGHT}px`}
                  ></div>
                {/each}

                {#if isCurrentDay(i)}
                  <div
                    class="current-time-bar"
                    style={`top:${currentTimePosition}px`}
                  ></div>
                {/if}

                {#each eventsByDay[i] ?? [] as ev}
                  <button onclick={() => openShow(ev.title)}>
                    <div
                      class="event"
                      style={`top:${ev.top}px; height:${ev.height}px`}
                    >
                      <div class="event-time">
                        {ev.startLabel} - {ev.endLabel}
                      </div>
                      <div class="event-title">{ev.title}</div>
                      {#if ev.description}
                        <div class="event-desc">{ev.description}</div>
                      {/if}
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .calendar-page {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: transparent;
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem 2rem;
    background: transparent;
    border-bottom: 1px solid #2a2a2a;
    position: relative;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title {
    font-weight: 600;
    color: #e5e7eb;
    font-size: 1.125rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(42, 42, 42, 0.7);
    color: #9ca3af;
    border: 1px solid #3a3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }
  .nav-btn:hover {
    background: #333;
    color: #e5e7eb;
    border-color: #4a4a4a;
  }

  .today-btn {
    width: auto;
    padding: 0 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .calendar-wrapper {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .calendar-scroll {
    display: flex;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .time-gutter {
    flex-shrink: 0;
    width: 72px;
    background: rgba(26, 26, 26, 0.5);
    border-right: 1px solid #2a2a2a;
    position: sticky;
    left: 0;
    z-index: 3;
  }

  .gutter-spacer {
    height: 52px;
    border-bottom: 1px solid #2a2a2a;
  }

  .gutter-hour {
    height: 84px;
    display: flex;
    align-items: flex-start;
    padding-top: 4px;
    padding-right: 8px;
    color: #6b7280;
    font-size: 0.75rem;
    text-align: right;
    justify-content: flex-end;
  }

  .days-container {
    flex: 1;
    min-width: 0;
  }

  .days-header {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    background: rgba(26, 26, 26, 0.5);
    border-bottom: 1px solid #2a2a2a;
    position: sticky;
    top: 0;
    z-index: 6;
  }

  .day-header {
    text-align: center;
    padding: 0.75rem 0.5rem;
    color: #9ca3af;
    font-size: 0.875rem;
    font-weight: 400;
    border-left: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .day-name {
    font-weight: 400;
    font-size: 0.875rem;
  }

  .day-date {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .day-header.current {
    background: #1e2530;
    color: #fff;
  }

  .day-header.current .day-date {
    opacity: 0.85;
  }

  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }

  .day {
    border-left: 1px solid #2a2a2a;
    min-width: 0;
  }

  .day-body {
    position: relative;
  }

  .hour-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background: #2a2a2a;
    pointer-events: none;
  }

  .current-time-bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: #ef4444;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
  }

  .current-time-bar::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
  }

  .event {
    position: absolute;
    left: 2px;
    right: 2px;
    background: #5175e1;
    border: none;
    color: white;
    border-radius: 8px;
    padding: 0.5rem 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 3px;
    overflow: hidden;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    z-index: 5;
  }

  .event:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  }

  .event-time {
    font-size: 0.7rem;
    opacity: 0.85;
    font-weight: 400;
  }

  .event-title {
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.25;
  }

  .event-desc {
    font-size: 0.72rem;
    opacity: 0.8;
    margin-top: 1px;
    line-height: 1.3;
  }

  /* Mobile: show ONLY current day */
  @media (max-width: 640px) {
    .toolbar {
      padding: 1rem;
    }

    .time-gutter {
      width: 60px;
    }

    .gutter-hour {
      font-size: 0.7rem;
      padding-right: 6px;
    }

    .days-header {
      grid-template-columns: 1fr;
    }

    .days-grid {
      grid-template-columns: 1fr;
    }

    .day {
      display: none;
    }

    .day.current {
      display: block;
    }

    .day-header {
      display: none;
    }

    .day-header.current {
      display: block;
    }

    .event {
      left: 2px;
      right: 2px;
      padding: 0.4rem;
    }

    .event-title {
      font-size: 0.8rem;
    }
  }
</style>
