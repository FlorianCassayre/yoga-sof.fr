'use client';

import { Alert, Box, CircularProgress, List, ListItem, Typography } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';

import { api } from '../../../server/api';
import { PersonLink } from '../../user/PersonLink';

interface CourseParticipantsSectionProps {
  courseId: number | null;
}

export const CourseParticipantsSection = ({ courseId }: CourseParticipantsSectionProps) => {
  const participantsQuery = api.registration.list.useQuery(
    {
      page: 0,
      pageSize: 100,
      sort: [{ field: 'userName', sort: 'asc' }],
      courseId: courseId ?? undefined,
    },
    { enabled: courseId !== null, placeholderData: keepPreviousData },
  );
  const participants = participantsQuery.data?.rows;

  return (
    <>
      <p className="course-participants-title">
        Participants ({participantsQuery.data?.total ?? 0})
      </p>
      {participantsQuery.error ? (
        <Alert severity="error">
          {participantsQuery.error instanceof Error
            ? participantsQuery.error.message
            : 'Une erreur est survenue.'}
        </Alert>
      ) : participantsQuery.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : participants && participants.length > 0 ? (
        <List disablePadding>
          {participants.map((participant) => (
            <ListItem key={participant.id} disableGutters>
              <PersonLink person={participant} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>Aucun participant inscrit.</Typography>
      )}
    </>
  );
};
