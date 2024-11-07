import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '이벤트 1 설명',
    location: '위치 1',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-07-02',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 2 설명',
    location: '위치 2',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: 'event 3',
    date: '2024-07-03',
    startTime: '11:00',
    endTime: '12:00',
    description: 'event 3 설명',
    location: '위치 3',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '월간 보고',
    date: '2024-07-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '월간 실적 보고',
    location: '회의실 B',
    category: '보고',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '5',
    title: '점심 약속',
    date: '2024-07-20',
    startTime: '12:00',
    endTime: '13:00',
    description: '팀원들과 점심 식사',
    location: '구내식당',
    category: '식사',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
];

const currentDate = new Date('2024-07-01');

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => result.current.setSearchTerm('이벤트 1'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '위치 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));

  act(() => result.current.setSearchTerm('위치 2'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 2 설명',
      location: '위치 2',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, currentDate, 'week'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-07-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '이벤트 1 설명',
      location: '위치 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-07-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '이벤트 2 설명',
      location: '위치 2',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'event 3',
      date: '2024-07-03',
      startTime: '11:00',
      endTime: '12:00',
      description: 'event 3 설명',
      location: '위치 3',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2024-07-18'), 'week'));

  act(() => result.current.setSearchTerm('회의'));
  expect(result.current.filteredEvents).toEqual([
    {
      id: '4',
      title: '월간 보고',
      date: '2024-07-20',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 실적 보고',
      location: '회의실 B',
      category: '보고',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 15,
    },
  ]);

  act(() => result.current.setSearchTerm('점심'));
  expect(result.current.filteredEvents).toEqual([
    {
      id: '5',
      title: '점심 약속',
      date: '2024-07-20',
      startTime: '12:00',
      endTime: '13:00',
      description: '팀원들과 점심 식사',
      location: '구내식당',
      category: '식사',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 5,
    },
  ]);
});
