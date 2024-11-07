import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

const mockEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2024-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

describe('useEventOperations - 이벤트 CRUD', () => {
  beforeEach(() => {
    setupMockHandlerCreation(mockEvents);
  });
  it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toEqual(mockEvents);
    });
  });

  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    const newEvent: Event = {
      id: '2',
      title: '새로운 회의',
      date: '2024-10-16',
      startTime: '13:00',
      endTime: '14:00',
      description: '새로운 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.saveEvent(newEvent);
    });

    await waitFor(() => {
      expect(result.current.events).toContainEqual(newEvent);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    const updatedEvent: Event = {
      ...mockEvents[0],
      title: '업데이트된 이벤트',
      endTime: '12:00',
    };

    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(updatedEvent);
    });

    await waitFor(() => {
      const updated = result.current.events.find((event) => event.id === updatedEvent.id);
      expect(updated?.title).toBe(updatedEvent.title);
      expect(updated?.endTime).toBe(updatedEvent.endTime);
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();

    const { result } = renderHook(() => useEventOperations(false));

    await act(async () => {
      await result.current.deleteEvent(mockEvents[0].id);
    });

    await waitFor(() => {
      expect(result.current.events).not.toContainEqual(mockEvents[0]);
    });
  });
});

describe('useEventOperations - Toast 알림', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json('Failed to fetch', { status: 500 });
      })
    );
    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '이벤트 로딩 실패',
        status: 'error',
      })
    );
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    const nonExistentEvent: Event = {
      id: '999',
      title: '존재하지 않는 이벤트',
      date: '2024-07-05',
      startTime: '10:00',
      endTime: '11:00',
      description: '존재하지 않는 설명',
      location: '어딘가',
      category: '오류',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 30,
    };

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.saveEvent(nonExistentEvent);
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    setupMockHandlerDeletion();

    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(true));

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });
});
