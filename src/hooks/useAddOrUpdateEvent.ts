import { useToast } from '@chakra-ui/react';
import { useState } from 'react';

import { Event, EventForm } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';

export const useAddOrUpdateEvent = (
  resetForm: () => void,
  // eslint-disable-next-line no-unused-vars
  saveEvent: (_eventData: Event | EventForm) => Promise<void>
) => {
  const toast = useToast();
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);

  const addOrUpdateEvent = async (
    eventData: Event | EventForm,
    events: Event[],
    startTimeError: string | null,
    endTimeError: string | null
  ) => {
    const { title, date, startTime, endTime } = eventData;

    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return { isOverlapDialogOpen, overlappingEvents, setIsOverlapDialogOpen, addOrUpdateEvent };
};
