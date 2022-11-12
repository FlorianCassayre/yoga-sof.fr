import React from 'react';
import { courses } from '../common/courses';
import { CourseType } from '@prisma/client';
import { Grid, Typography, Chip, CardContent, Card, CardActionArea, CardMedia } from '@mui/material';
import { Accessibility, AccessTime, DarkMode, Groups } from '@mui/icons-material';
import { CourseTypeNames } from '../../../lib/common/newCourse';

interface HomepageCourseProps {
  course: typeof courses[CourseType];
  imageUrl: string;
  children: React.ReactNode;
}

const HomepageCourse: React.FC<HomepageCourseProps> = ({ course, imageUrl, children }) => {
  const { type, age, level, group, duration } = course;

  return (
    <Grid item xs={12}>
      <CardActionArea component="a" href="#">
        <Card elevation={4} sx={{ display: { xs: 'inherit', md: 'flex' } }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
              Séances de {CourseTypeNames[type]}
            </Typography>
            {children}
            <Grid container justifyContent="center">
              <Chip icon={<Accessibility />} label={age} variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<DarkMode />} label={level} variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<Groups />} label={group} variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<AccessTime />} label={duration} variant="outlined" sx={{ m: 0.5 }} />
            </Grid>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: { md: 300 }, height: { xs: 300, md: 'inherit' } }}
            image={imageUrl}
            alt="Image d'illustration"
          />
        </Card>
      </CardActionArea>
    </Grid>
  );
};


interface HomepageCoursesProps {
  children: React.ReactNode;
}

const HomepageCourses: React.FC<HomepageCoursesProps> & { Course: typeof HomepageCourse } = ({ children }) => {
  return (
    <Grid container spacing={4} sx={{ mb: 3 }}>
      {children}
    </Grid>
  );
};

HomepageCourses.Course = HomepageCourse;

export { HomepageCourses };
