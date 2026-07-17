import { bootstrapApplication } from '@angular/platform-browser';
import dayjs from 'dayjs';
import 'dayjs/locale/nl';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// Global — dayjs' locale is process-wide state, not per-instance, so this affects every
// dayjs(...).format(...) call across the whole app (all of them already assume Dutch text).
dayjs.locale('nl');

bootstrapApplication(App, appConfig)
    .catch(err => console.error(err));
