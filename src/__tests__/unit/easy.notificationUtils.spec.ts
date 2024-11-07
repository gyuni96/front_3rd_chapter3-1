import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
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
      date: '2024-07-01',
      startTime: '09:50',
      endTime: '10:50',
      description: '이벤트 2 설명',
      location: '위치 2',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: 'event 3',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: 'event 3 설명',
      location: '위치 3',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2024-07-01T08:50');
    const notifiedEvents = ['2'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(1);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-07-01T08:50');
    const notifiedEvents = ['1', '2'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-07-01T08:40');
    const notifiedEvents = ['2'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2024-07-01T09:00');
    const notifiedEvents = ['2'];
    const upcomingEvents = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(upcomingEvents).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
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
    };

    const notificationMessage = createNotificationMessage(event);
    expect(notificationMessage).toBe('10분 후 이벤트 1 일정이 시작됩니다.');
  });
});
