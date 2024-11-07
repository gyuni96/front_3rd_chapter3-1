import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
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
      title: '이벤트 4',
      date: '2024-07-24',
      startTime: '12:00',
      endTime: '13:00',
      description: '이벤트 4 설명',
      location: '위치 4',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '5',
      title: 'event 5',
      date: '2024-08-01',
      startTime: '13:00',
      endTime: '14:00',
      description: 'event 5 설명',
      location: '위치 5',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const event2Filter = getFilteredEvents(mockEvents, '이벤트 2', new Date('2024-07-01'), 'week');

    expect(event2Filter).toHaveLength(1);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const weekEvent = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');

    expect(weekEvent).toHaveLength(3);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const monthEvent = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');

    expect(monthEvent).toHaveLength(4);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const weekView = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-01'), 'week');

    expect(weekView).toHaveLength(2);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const allEvents = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');

    expect(allEvents).toHaveLength(4);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const caseInsensitive = getFilteredEvents(mockEvents, 'EVENT', new Date('2024-07-01'), 'week');

    expect(caseInsensitive).toHaveLength(1);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const monthEvent = getFilteredEvents(mockEvents, '', new Date('2024-07-31'), 'month');

    expect(monthEvent).toHaveLength(4);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const emptyEvents = getFilteredEvents([], '', new Date('2024-07-01'), 'week');

    expect(emptyEvents).toHaveLength(0);
  });
});
