import React from 'react';
import { courses } from '../common/courses';
import { CourseType } from '@prisma/client';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { CourseTypeNames } from '../../../lib/common/newCourse';

interface CourseSectionProps {
  course: typeof courses[CourseType];
  imageUrl: string;
  children: React.ReactNode;
}

export const CourseSection: React.FC<CourseSectionProps> = ({ course, imageUrl, children }) => {
  const { type } = course;

  const bullets: { title: string, content: React.ReactNode }[] = [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={12} md={8} lg={9}>
            <Typography variant="h6" component="div">
              {CourseTypeNames[type]}
            </Typography>
            {children}
          </Grid>
          <Grid item xs={8} sm={6} md={4} lg={3}>
            <img src={imageUrl} alt={CourseTypeNames[type]} style={{ width: '100%', borderRadius: '4px' }} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
