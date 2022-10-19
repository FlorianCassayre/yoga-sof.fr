import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { trpc } from '../lib/common/trpc';
import { useSession } from 'next-auth/react';
import { CourseModel } from '@prisma/client';
import { CourseTypeNames } from '../lib/common/newCourse';
import { Create, Delete, Edit, Event } from '@mui/icons-material';

interface CourseModelCard {
  courseModel: CourseModel;
  editable?: boolean;
}

const CourseModelCard: React.FC<CourseModelCard> = ({ courseModel: { type }, editable }) => {
  const handleDelete = () => {

  };

  const handleEdit = () => {

  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1}>
          <Event />
          <Typography variant="h5" component="div">
            {CourseTypeNames[type]}
          </Typography>
        </Stack>
        <Typography color="text.secondary">
          adjective
        </Typography>
      </CardContent>
      {!editable && (
        <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton size="small" aria-label="Supprimer" onClick={() => handleDelete()}><Delete /></IconButton>
          <IconButton size="small" aria-label="Modifier" onClick={() => handleEdit()}><Edit /></IconButton>
        </CardActions>
      )}
    </Card>
  );
}

const GridItem: React.FC = ({ children }) => (
  <Grid item xs={12} sm={6} lg={4} xl={3}>
    {children}
  </Grid>
);

interface NewCourseModelCardsProps {
  editable?: boolean;
}

export const CourseModelCards: React.FC<NewCourseModelCardsProps> = ({ editable }) => {
  const { data, isError, isLoading } = trpc.useQuery(['courseModel.getAll']);

  const session = useSession();

  const defaultHeight = 150;

  return (
    <Grid container spacing={2}>
      {data ? (
          <>
            {data.map((courseModel) =>
              <GridItem key={courseModel.id}>
                <CourseModelCard courseModel={courseModel} />
              </GridItem>
            )}
            <GridItem>
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: defaultHeight, p: 2, border: '1px dashed lightgrey', borderRadius: 1 }}>
                <Button startIcon={<Create />}>Nouveau modèle</Button>
              </Box>
            </GridItem>
          </>
        )
        : isLoading ? (
          [0, 1].map(i => (
            <GridItem key={i}>
              <Skeleton variant="rounded" height={defaultHeight} />
            </GridItem>
          ))
        ) : (
          <>
            error
          </>
        )}
    </Grid>
  );
};
