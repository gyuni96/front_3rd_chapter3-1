import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
// import { parseHM } from '../utils.ts'; 어디서 사용해야될지.. 잘모르겠습니다...

const events: Event[] = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2024-07-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '이벤트 1 설명',
    location: '위치 1',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2024-07-02',
    startTime: '11:00',
    endTime: '12:00',
    description: '이벤트 2 설명',
    location: '위치 2',
    category: '개인',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: 'event 3',
    date: '2024-07-03',
    startTime: '12:00',
    endTime: '13:00',
    description: 'event 3 설명',
    location: '위치 3',
    category: '업무',
    repeat: { type: 'weekly', interval: 1 },
    notificationTime: 30,
  },
];

describe('useNotifications 테스트', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(events));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.notifiedEvents).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
    vi.setSystemTime(new Date('2024-07-01T09:30:00'));

    const { result } = renderHook(() => useNotifications(events));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // 첫 번째 이벤트에 대한 알림이 생성되어야 함
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe('1');
    expect(result.current.notifications[0].message).toEqual(`30분 후 이벤트 1 일정이 시작됩니다.`);
    expect(result.current.notifiedEvents).toEqual(['1']);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
    vi.setSystemTime(new Date('2024-07-01T09:30:00'));

    const { result } = renderHook(() => useNotifications(events));
    await act(async () => {
      // 알람 생성
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);
    // 첫 번째 알림(인덱스 0)을 제거
    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toHaveLength(0);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
    vi.setSystemTime(new Date('2024-07-01T09:30:00'));

    const { result } = renderHook(() => useNotifications(events));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');
    // 1초뒤 Interval 시에도 같은 이벤트에 대해 중복 알림이 발생하였는지 확인
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain('1');

    // 추가 시간 경과 후에도 동일한 이벤트에 대한 중복 알림이 발생하지 않는지 확인
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000); // 10분
    });

    expect(result.current.notifications).toHaveLength(1); // 추가 알림 없음
    expect(result.current.notifiedEvents).toContain('1');
  });
});
