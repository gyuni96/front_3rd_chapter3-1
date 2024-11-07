import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2024-07-01', '14:30');
    expect(date).toEqual(new Date('2024-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-04-44', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-04-24', '30:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(mockEvent);
    expect(dateRange).toEqual({
      start: new Date('2024-10-01T09:00'),
      end: new Date('2024-10-01T10:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2024-90-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(mockEvent);

    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const mockEvent: Event = {
      id: '1',
      title: '기존 회의',
      date: '2024-10-01',
      startTime: '99:00',
      endTime: '80:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const dateRange = convertEventToDateRange(mockEvent);

    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  const mockEvent: Event = {
    id: '1',
    title: '기존 회의',
    date: '2024-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const newMockEvent: Event = {
      id: '2',
      title: '새 회의',
      date: '2024-10-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const isOverlap = isOverlapping(mockEvent, newMockEvent);
    expect(isOverlap).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const newMockEvent: Event = {
      id: '2',
      title: '새 회의',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    const isOverlap = isOverlapping(mockEvent, newMockEvent);
    expect(isOverlap).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '새 회의',
      date: '2024-10-01',
      startTime: '09:30',
      endTime: '10:30',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '새 회의2',
      date: '2024-10-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newMockEvent: Event = {
      id: '4',
      title: '새 회의3',
      date: '2024-10-01',
      startTime: '09:45',
      endTime: '10:45',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newMockEvent, mockEvents);
    expect(overlappingEvents).toHaveLength(3);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newMockEvent: Event = {
      id: '4',
      title: '새 회의3',
      date: '2024-10-01',
      startTime: '11:00',
      endTime: '12:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const overlappingEvents = findOverlappingEvents(newMockEvent, mockEvents);
    expect(overlappingEvents).toHaveLength(0);
    expect(overlappingEvents).toEqual([]);
  });
});
