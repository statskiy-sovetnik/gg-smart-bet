import {getCookie} from '@/utils/getCookie';
import {setCookie} from '@/utils/setCookie';

export function eraseCookie(name: string): void {
  if (getCookie(name)) {
    setCookie(name, '', new Date(0));
  }
}
