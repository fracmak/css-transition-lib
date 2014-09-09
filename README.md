css-transition-lib
==================

Provides a simple animation library for css transitions using the power of jquery promises. Also falls back to jQuery's animate function when hardware or browser doesn't support the css animation. Behavior of api is the same between css transitions and jQuery's animate() function for ease of use.

Usage
==================
```javascript
CSSAnimate.animate(els, property, value, timeMs, easing, delay);
```
returns a jQuery [Promise](http://api.jquery.com/Types/#Promise) object that resolves when the animation completes or rejects if the animation is stopped or interrupted by the css property being manually changed

The function accepts multiple els or a single element. 

```javascript
CSSAnimate.stop(el, property);
```
Stops the animation on that specific property. Returns the current css value as reported by window.getComputedStyle

Easing
==================
We support both css easing names as well as jquery ui easing names. The library will automatically convert from one type to the other depending on what is desired. Here is how the mapping is currently being done

jQuery Easing | CSS Easing |
--------------|------------|
easeInQuad  | ease-in  |
easeInSine  | ease-in  |
easeInCubic | ease-in |
easeInQuart | ease-in |
easeInQuint | ease-in |
easeInExpo | ease-in |
easeInCirc | ease-in |
easeInBack | ease-in |
easeInElastic | ease-in |
easeInBounce | ease-in |
easeOutQuad | ease-out |
easeOutSine | ease-out |
easeOutCubic | ease-out |
easeOutQuart | ease-out |
easeOutQuint | ease-out |
easeOutExpo | ease-out |
easeOutCirc | ease-out |
easeOutBack | ease-out |
easeOutElastic | ease-out |
easeOutBounce | ease-out |
easeInOutQuad | ease-in-out |
easeInOutSine | ease-in-out |
easeInOutCubic | ease-in-out |
easeInOutQuart | ease-in-out |
easeInOutQuint | ease-in-out |
easeInOutExpo | ease-in-out |
easeInOutCirc | ease-in-out |
easeInOutBack | ease-in-out |
easeInOutElastic | ease-in-out |
easeInOutBounce | ease-in-out |
swing | ease-in-out
