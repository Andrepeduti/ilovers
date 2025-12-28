import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    scrollToTop() {
        if (isPlatformBrowser(this.platformId)) {
            // 1. Try window scroll
            window.scrollTo(0, 0);

            // 2. Try body/html scroll
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            // 3. Try specifically ensuring standard behavior if there are wrappers
            // We can also target specific containers if we identify them, but usually window/body covers it
            // unless 'height: 100%; overflow: hidden' is on body, then a child scrolls.
            // If we are in that case, we need to find the scroller.

            // Attempt to scroll 'app-root' if it has styles making it a container?
            // Not typical unless configured.
        }
    }
}
