import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons';
import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useRef } from 'react';

import { useAddOrUpdateEvent } from './hooks/useAddOrUpdateEvent.ts';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useSearch } from './hooks/useSearch.ts';
import MonthView from './pages/MonthView.tsx';
import WeekView from './pages/WeekView.tsx';
import { Event, EventForm, RepeatType } from './types';
import { getTimeErrorMessage } from './utils/timeValidation';

export const categories = ['업무', '개인', '가족', '기타'];

export const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent } = useEventOperations(Boolean(editingEvent), () =>
    setEditingEvent(null)
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);
  const { isOverlapDialogOpen, overlappingEvents, addOrUpdateEvent, setIsOverlapDialogOpen } =
    useAddOrUpdateEvent(resetForm, saveEvent);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const eventData: Event | EventForm = {
    id: editingEvent ? editingEvent.id : undefined,
    title,
    date,
    startTime,
    endTime,
    description,
    location,
    category,
    repeat: {
      type: isRepeating ? repeatType : 'none',
      interval: repeatInterval,
      endDate: repeatEndDate || undefined,
    },
    notificationTime,
  };

  return (
    <Box w="full" h="100vh" m="auto" p={5}>
      <Flex gap={6} h="full">
        <VStack w="400px" spacing={5} align="stretch">
          <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

          <FormControl>
            <FormLabel>제목</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>날짜</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </FormControl>

          <HStack width="100%">
            <FormControl>
              <FormLabel>시작 시간</FormLabel>
              <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
                <Input
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl>
              <FormLabel>종료 시간</FormLabel>
              <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
                <Input
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  isInvalid={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>설명</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>위치</FormLabel>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>카테고리</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>반복 설정</FormLabel>
            <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
              반복 일정
            </Checkbox>
          </FormControl>

          <FormControl>
            <FormLabel>알림 설정</FormLabel>
            <Select
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {notificationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormControl>

          {isRepeating && (
            <VStack width="100%">
              <FormControl>
                <FormLabel>반복 유형</FormLabel>
                <Select
                  value={repeatType}
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <option value="daily">매일</option>
                  <option value="weekly">매주</option>
                  <option value="monthly">매월</option>
                  <option value="yearly">매년</option>
                </Select>
              </FormControl>
              <HStack width="100%">
                <FormControl>
                  <FormLabel>반복 간격</FormLabel>
                  <Input
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    min={1}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>반복 종료일</FormLabel>
                  <Input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </HStack>
            </VStack>
          )}

          <Button
            data-testid="event-submit-button"
            onClick={() => addOrUpdateEvent(eventData, events, startTimeError, endTimeError)}
            colorScheme="blue"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </VStack>
        <VStack flex={1} spacing={5} align="stretch">
          <Heading>일정 보기</Heading>

          <HStack mx="auto" justifyContent="space-between">
            <IconButton
              aria-label="Previous"
              icon={<ChevronLeftIcon />}
              onClick={() => navigate('prev')}
            />
            <Select
              aria-label="view"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
            </Select>
            <IconButton
              aria-label="Next"
              icon={<ChevronRightIcon />}
              onClick={() => navigate('next')}
            />
          </HStack>

          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              notifiedEvents={notifiedEvents}
              filteredEvents={filteredEvents}
            />
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              holidays={holidays}
              notifiedEvents={notifiedEvents}
              filteredEvents={filteredEvents}
            />
          )}
        </VStack>
        <VStack data-testid="event-list" w="500px" h="full" overflowY="auto">
          <FormControl>
            <FormLabel>일정 검색</FormLabel>
            <Input
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Text>검색 결과가 없습니다.</Text>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} borderWidth={1} borderRadius="lg" p={3} width="100%">
                <HStack justifyContent="space-between">
                  <VStack align="start">
                    <HStack>
                      {notifiedEvents.includes(event.id) && <BellIcon color="red.500" />}
                      <Text
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                      >
                        {event.title}
                      </Text>
                    </HStack>
                    <Text>{event.date}</Text>
                    <Text>
                      {event.startTime} - {event.endTime}
                    </Text>
                    <Text>{event.description}</Text>
                    <Text>{event.location}</Text>
                    <Text>카테고리: {event.category}</Text>
                    {event.repeat.type !== 'none' && (
                      <Text>
                        반복: {event.repeat.interval}
                        {event.repeat.type === 'daily' && '일'}
                        {event.repeat.type === 'weekly' && '주'}
                        {event.repeat.type === 'monthly' && '월'}
                        {event.repeat.type === 'yearly' && '년'}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Text>
                    )}
                    <Text>
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Text>
                  </VStack>
                  <HStack>
                    <IconButton
                      aria-label="Edit event"
                      icon={<EditIcon />}
                      onClick={() => editEvent(event)}
                    />
                    <IconButton
                      aria-label="Delete event"
                      icon={<DeleteIcon />}
                      onClick={() => deleteEvent(event.id)}
                    />
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      </Flex>

      <AlertDialog
        isOpen={isOverlapDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOverlapDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              일정 겹침 경고
            </AlertDialogHeader>

            <AlertDialogBody>
              다음 일정과 겹칩니다:
              {overlappingEvents.map((event) => (
                <Text key={event.id}>
                  {event.title} ({event.date} {event.startTime}-{event.endTime})
                </Text>
              ))}
              계속 진행하시겠습니까?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  setIsOverlapDialogOpen(false);
                  saveEvent({
                    id: editingEvent ? editingEvent.id : undefined,
                    title,
                    date,
                    startTime,
                    endTime,
                    description,
                    location,
                    category,
                    repeat: {
                      type: isRepeating ? repeatType : 'none',
                      interval: repeatInterval,
                      endDate: repeatEndDate || undefined,
                    },
                    notificationTime,
                  });
                }}
                ml={3}
              >
                계속 진행
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {notifications.length > 0 && (
        <VStack position="fixed" top={4} right={4} spacing={2} align="flex-end">
          {notifications.map((notification, index) => (
            <Alert key={index} status="info" variant="solid" width="auto">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">{notification.message}</AlertTitle>
              </Box>
              <CloseButton
                onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
              />
            </Alert>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default App;
