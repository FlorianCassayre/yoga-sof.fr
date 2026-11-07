import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fireEvent, render, screen } from '@testing-library/react';
import { format, startOfWeek } from 'date-fns';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { WeekCalendar } from '../../../features/course/batch/WeekCalendar';

const mondayOf = (dayNumber: number): string => {
  const now = new Date();

  return format(
    startOfWeek(new Date(now.getFullYear(), now.getMonth(), dayNumber), { weekStartsOn: 1 }),
    'yyyy-MM-dd',
  );
};

const renderCalendar = (onChange: (weeks: string[]) => void) =>
  render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <WeekCalendar weeks={[]} onChange={onChange} />
    </LocalizationProvider>,
  );

describe('WeekCalendar', () => {
  it('selects a range over two clicks', () => {
    const onChange = vi.fn();
    renderCalendar(onChange);

    fireEvent.click(screen.getByText('9'));
    expect(onChange).toHaveBeenLastCalledWith([mondayOf(9)]);

    fireEvent.click(screen.getByText('17'));
    expect(onChange).toHaveBeenLastCalledWith([mondayOf(9), mondayOf(17)]);
  });

  it('previews the range while hovering before the second click', () => {
    const onChange = vi.fn();
    renderCalendar(onChange);

    fireEvent.click(screen.getByText('9'));
    fireEvent.pointerEnter(screen.getByText('17'));
    fireEvent.click(screen.getByText('17'));

    expect(onChange).toHaveBeenLastCalledWith([mondayOf(9), mondayOf(17)]);
  });

  it('resets the anchor on the next click and commits a new range', () => {
    const onChange = vi.fn();
    renderCalendar(onChange);

    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('17'));
    fireEvent.click(screen.getByText('23'));
    expect(onChange).toHaveBeenLastCalledWith([mondayOf(23)]);

    fireEvent.click(screen.getByText('30'));
    expect(onChange).toHaveBeenLastCalledWith([mondayOf(23), mondayOf(30)]);
  });

  it('keeps the committed band visible after the second click', () => {
    const onChange = vi.fn();
    renderCalendar(onChange);

    const firstBefore = screen.getByText('9').className;
    const lastBefore = screen.getByText('17').className;

    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('17'));

    expect(screen.getByText('9').className).not.toBe(firstBefore);
    expect(screen.getByText('17').className).not.toBe(lastBefore);
  });

  it('keeps the range in sync through a real form state', () => {
    const Harness = () => {
      const { watch, setValue } = useForm<{ weeks: string[] }>({ defaultValues: { weeks: [] } });
      const weeks = watch('weeks');

      return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div data-testid="weeks">{weeks.join(',')}</div>
          <WeekCalendar weeks={weeks} onChange={(next) => setValue('weeks', next)} />
        </LocalizationProvider>
      );
    };
    render(<Harness />);

    fireEvent.click(screen.getByText('9'));
    fireEvent.click(screen.getByText('17'));

    expect(screen.getByTestId('weeks').textContent).toBe(`${mondayOf(9)},${mondayOf(17)}`);
  });
});
