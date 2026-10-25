import type { CourseVisibility } from '@yoga-sof/core';
import type { LucideIcon } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

export const COURSE_VISIBILITY_ICONS: Record<CourseVisibility, LucideIcon> = {
  public: Eye,
  private: EyeOff,
};
