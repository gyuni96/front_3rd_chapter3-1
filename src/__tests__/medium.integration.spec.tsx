import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  /**
   * ChakraProvider로 묶어주는 동작의 의미.
   * ChakraProvider는 Chakra UI의 테마와 스타일을 적용해주는 ProVider.
   */
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  afterEach(() => {
    // 각 테스트가 끝날 때마다 서버 핸들러를 초기화하여 테스트 간 상태가 격리되도록 함
    server.resetHandlers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 이벤트 상태가 일관되지 않을 수 잇다.
    // 여러 테스트가 같은 상태를 공유할때 문제가 생길 수 있다. 그래서 각 테스트가 끝날 때마다 서버 핸들러를 초기화

    const initEvents: Event[] = []; // 초기 이벤트 상태
    setupMockHandlerCreation(initEvents);
    const { user } = setup(<App />);

    const eventData = {
      title: '이벤트',
      date: '2024-10-10',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    };

    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();

    await saveSchedule(user, eventData);

    await waitFor(() => {
      expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(within(eventList).getByText(eventData.title)).toBeInTheDocument();
      expect(within(eventList).getByText(eventData.location)).toBeInTheDocument();
      expect(within(eventList).getByText(eventData.description)).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    const editButton = within(eventList).getAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText(/제목/));
    await user.type(screen.getByLabelText('제목'), '이벤트 수정');
    await user.clear(screen.getByLabelText(/날짜/));
    await user.type(screen.getByLabelText('날짜'), '2024-10-26');
    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.clear(screen.getByLabelText(/설명/));
    await user.type(screen.getByLabelText('설명'), '팀 점심 식사');
    await user.clear(screen.getByLabelText(/위치/));
    await user.type(screen.getByLabelText('위치'), '식당');
    await user.selectOptions(screen.getByLabelText(/카테고리/), '기타');
    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).queryByText('기존 회의')).not.toBeInTheDocument();
      expect(within(eventList).getByText('이벤트 수정')).toBeInTheDocument();
      expect(within(eventList).getByText('식당')).toBeInTheDocument();
      expect(within(eventList).getByText('팀 점심 식사')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('삭제할 이벤트입니다')).toBeInTheDocument();
    });

    const deleteButton = await within(eventList).findAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButton[0]);

    await waitFor(() => {
      expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('2024-10-05')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('view'), 'week');
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('2024-10-05')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01')); // 날짜 변경
    setup(<App />);

    expect(screen.getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setup(<App />);
    const eventList = screen.getByTestId('event-list');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-05',
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
        title: '개인 일정',
        date: '2024-10-06',
        startTime: '11:00',
        endTime: '12:00',
        description: '개인 미팅',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 15,
      },
    ];

    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchInput, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('개인 일정')).not.toBeInTheDocument();

    await user.clear(searchInput);

    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).getByText('개인 일정')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const newEvent: Omit<Event, 'id' | 'notificationTime' | 'repeat'> = {
      title: '팀 회의',
      date: '2024-10-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');

    await waitFor(() => within(eventList).getByText('기존 회의'));

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);

    await user.clear(screen.getByLabelText(/시작 시간/));
    await user.type(screen.getByLabelText('시작 시간'), '11:00');

    await user.clear(screen.getByLabelText(/종료 시간/));
    await user.type(screen.getByLabelText('종료 시간'), '12:00');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(screen.getByText(/다음 일정과 겹칩니다/)).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2024-11-11T08:50:00'));
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '알람 이벤트',
      date: '2024-11-11',
      startTime: '09:00',
      endTime: '10:00',
      description: '알람 이벤트 설명',
      location: '알람 이벤트 위치',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  setupMockHandlerCreation(mockEvents);

  setup(<App />);

  const eventList = screen.getByTestId('event-list');

  await waitFor(() => {
    expect(within(eventList).queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByText(/일정이 시작됩니다/)).toBeInTheDocument();
  });
});
