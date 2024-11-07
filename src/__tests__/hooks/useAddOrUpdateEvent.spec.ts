import { act, renderHook } from '@testing-library/react';

import { useAddOrUpdateEvent } from '../../hooks/useAddOrUpdateEvent';
import { Event } from '../../types';

// 모의 객체 생성
const mockToast = vi.fn();
const mockResetForm = vi.fn();
const mockSaveEvent = vi.fn();

// Chakra UI의 useToast 모킹
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useAddOrUpdateEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 필드가 누락된 경우 에러 토스트를 표시한다', async () => {
    const { result } = renderHook(() => useAddOrUpdateEvent(mockResetForm, mockSaveEvent));

    await act(async () => {
      await result.current.addOrUpdateEvent(
        {
          title: '',
          date: '',
          startTime: '',
          endTime: '',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 0,
        },
        [],
        null,
        null
      );
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '필수 정보를 모두 입력해주세요.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('시간 에러가 있는 경우 에러 토스트를 표시한다', async () => {
    const { result } = renderHook(() => useAddOrUpdateEvent(mockResetForm, mockSaveEvent));

    await act(async () => {
      await result.current.addOrUpdateEvent(
        {
          title: '테스트',
          date: '2024-07-01',
          startTime: '10:00',
          endTime: '09:00',
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 0,
        },
        [],
        '시작 시간 오류',
        null
      );
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '시간 설정을 확인해주세요.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it('정상적인 일정 추가시 저장하고 폼을 초기화한다', async () => {
    const { result } = renderHook(() => useAddOrUpdateEvent(mockResetForm, mockSaveEvent));

    const newEvent: Event = {
      id: String(Date.now()),
      title: '새 회의',
      date: '2024-07-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 0,
    };

    await act(async () => {
      await result.current.addOrUpdateEvent(newEvent, [], null, null);
    });

    expect(mockSaveEvent).toHaveBeenCalledWith(newEvent);
    expect(mockResetForm).toHaveBeenCalled();
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
