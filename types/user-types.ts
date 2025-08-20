import { User } from 'firebase/auth';

export interface ExtendedUser extends User {
  name?: string;
  username?: string;
  details?: string;
  location?: string;
  model?: string;
  theme?: string;
  colorTheme?: string;
  timeFormat?: string;
}
