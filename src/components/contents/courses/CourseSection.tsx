import React, { useMemo } from 'react';
import { courses } from '../common/courses';
import { CourseModel, CourseType } from '@prisma/client';
import { Box, Button, Card, CardContent, CardMedia, Grid, Skeleton, Typography } from '@mui/material';
import { CourseTypeNames } from '../../../common/course';
import Link from 'next/link';
import { Assignment } from '@mui/icons-material';
import { InformationTable } from '../../InformationTable';
import { trpc } from '../../../common/trpc';
import { formatColonTimeHHhMM, WeekdayNames } from '../../../common/date';

interface CourseSectionProps {
  course: typeof courses[CourseType];
  imageUrl: string;
  children: React.ReactNode;
}

export const CourseSection: React.FC<CourseSectionProps> = ({ course, imageUrl, children }) => {
  const { type, anchor, isRegistrationOnline, notStarted, age, level, group, duration, price, location, stuff, registration } = course;
  const { data: modelsData, isLoading: isModelsLoading } = trpc.public.findAllModels.useQuery();
  const modelsDataGrouped = useMemo(() => {
    if (modelsData) {
      const modelsFiltered = modelsData.filter(({ type }) => type === course.type);
      const weekdaysMap = Object.fromEntries(Array.from(new Set(modelsFiltered.map(({ weekday }) => weekday))).map(weekday => [weekday, [] as CourseModel[]]));
      modelsFiltered.forEach(model => weekdaysMap[model.weekday].push(model));
      return Object.entries(weekdaysMap)
        .map(([weekday, models]) => [parseInt(weekday), models.sort((a, b) => a.timeStart < b.timeStart ? -1 : 1)] as const)
        .sort(([a,], [b,]) => a - b);
    } else {
      return undefined;
    }
  }, [modelsData]);

  const bullets: { title: string, content: React.ReactNode }[] = [];

  return (
    <Card elevation={4} sx={{ mt: 2, display: { xs: 'inherit', md: 'flex' } }} id={anchor}>
      <CardContent sx={{ flex: 1 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
          {CourseTypeNames[type]}
        </Typography>
        {children}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5}>
            <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
              Détails
            </Typography>
            <InformationTable rows={[
              { header: 'Âge', value: age },
              { header: 'Niveau', value: level },
              { header: 'Groupe', value: group },
              { header: 'Durée', value: duration },
              { header: 'Tarif', value: price },
            ]} />
          </Grid>
          {!notStarted && (<Grid item xs={12} sm={7}>
            <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
              Informations pratiques
            </Typography>
            <InformationTable rows={[
              {
                header: 'Créneaux',
                value: isModelsLoading || !modelsDataGrouped ? <Skeleton /> : (
                  modelsDataGrouped.map(([weekday, models]) =>
                    [WeekdayNames[weekday] + 's', models.map(({ timeStart, timeEnd }) =>
                      ['de', formatColonTimeHHhMM(timeStart), 'à', formatColonTimeHHhMM(timeEnd)].join(' ')).join(', et ')].join(' ')).join(' ; ')
                ),
              },
              { header: 'Lieu', value: location },
              { header: 'Matériel', value: stuff },
              { header: 'Inscription', value: registration },
            ]} />
          </Grid>)}
        </Grid>
        {isRegistrationOnline && (
          <Box textAlign="center">
            <Link href="/inscription" passHref legacyBehavior>
              <Button variant="outlined" startIcon={<Assignment />}>Inscription en ligne</Button>
            </Link>
          </Box>
        )}
      </CardContent>
      <CardMedia
        component="img"
        sx={{ width: { md: 200 }, height: { xs: 0, md: 'inherit' } }}
        image={imageUrl}
        alt={CourseTypeNames[type]}
      />
    </Card>
  );
};
