import { PublicOffOutlined, PublicOutlined } from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material';
import type { CourseVisibility } from '@yoga-sof/core';
import type { ComponentType } from 'react';

export const COURSE_VISIBILITY_ICONS: Record<CourseVisibility, ComponentType<SvgIconProps>> = {
  public: PublicOutlined,
  private: PublicOffOutlined,
};
