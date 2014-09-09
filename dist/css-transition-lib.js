/*! css-transition-lib - v0.0.2 - 2014-09-09
* https://github.com/fracmak/css-transition-lib
* Copyright (c) 2014 Jay Merrifield; Licensed MIT */
(function(factory) {
    'use strict';
    // CSS Transition Lib supports amd if it's available
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function ($) {
            window.CSSAnimate = factory($);
        });
    } else {
        window.CSSAnimate = factory(window.jQuery || window.Zepto || window.$);
    }
}(function($){
    'use strict';
    function getPrefixed(prop) {
        var i, s = document.createElement('p').style, v = ['ms', 'O', 'Moz', 'Webkit'];
        if (s[prop] === '') {
            return prop;
        }
        prop = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (i = v.length; i--;) {
            if (s[v[i] + prop] === '') {
                return (v[i] + prop);
            }
        }
    }
    function getTransitionEndName(transitionName) {
        var options = {
            'WebkitTransition' : 'webkitTransitionEnd',
            'MozTransition'    : 'transitionend',
            'OTransition'      : 'oTransitionEnd',
            'msTransition'     : 'MSTransitionEnd',
            'transition'       : 'transitionend'
        };
        return options[transitionName];
    }

    var CSSAnimate = function(transitionCssName) {
        this.transitionCssName = transitionCssName;
        this.transitionEndName = getTransitionEndName(transitionCssName);
    };
    CSSAnimate.prototype = {
        /*
         * Utility function that will animate an element using css or jquery animation
         * based on the capabilities of the browser
         * @param {jQuery|Array<jQuery>|Element} el element or elements to animate
         * @param {String} property property name to animate
         * @param {String} value property value to animate to
         * @param {Number} timeMs time in milliseconds the animation should take
         * @param {String} [easing] the easing algorithm to use, defaults to 'linear' if absent
         * @param {Number} [delay=0] time in milliseconds the animation should delay for
         * @return {Deferred} promise that will resolve when the animation finishes
         */
        animate: function(el, property, value, timeMs, easing, delay){
            var _this = this;
            el = $(el);
            if (el.length === 0){
                console.error('tried animating null or empty jquery object');
                return $.Deferred().reject();
            }
            return $.when.apply($, $.map(el, function(element) {
                if(_this.transitionCssName) {
                    return _this.cssTransition($(element), property, value, timeMs, easing, delay);
                } else {
                    return _this.jQuery($(element), property, value, timeMs, easing, delay);
                }
            }));
        },
        /**
         * Utility function that will animate an element using css transitions
         * @param {jQuery} el element to animate
         * @param {String} property property name to animate
         * @param {String} value property value to animate to
         * @param {Number} timeMs time in milliseconds the animation should take
         * @param {String} easing the easing algorithm to use, defaults to 'linear' if absent
         * @param {String|Number} [delay=0] time in milliseconds (no units) the animation should delay for
         * @return {Deferred} promise that will resolve when the animation finishes
         */
        cssTransition: function(el, property, value, timeMs, easing, delay) {
            var camelProperty;
            if (property === 'opacity' && el.css('display') === 'none') {
                // we can't/don't animate opacity on hidden elements
                timeMs = 0;
            }
            if (this._isDocumentHidden()) {
                el.css(property, value);
                return $.Deferred().resolve();
            } else {
                if (timeMs !== 0 && timeMs < 40) {
                    // animations with timing less than 40 causes serious issues with firefox
                    // 0 is still allowed
                    timeMs = 40;
                }
                easing = this._normalizeEasing(easing, false);
                camelProperty = $.camelCase(property);
                value = this._getCssNumber(camelProperty, value);
                if (delay) {
                    delay = ' ' + delay + 'ms';
                } else {
                    delay = '';
                }
                return this._transition(el, property, camelProperty, value, timeMs, easing, delay);
            }
        },
        jQuery: function (el, property, value, timeMs, easing, delay) {
            if (this._isDocumentHidden()) {
                el.css(property, value);
                return $.Deferred().resolve();
            } else {
                var properties = {};
                easing = this._normalizeEasing(easing, true);
                properties[property] = value;
                return $.Deferred(function(defer) {
                    var queueName = 'proganimate' + property;
                    el.stop(queueName, true);
                    if (timeMs === 0) { // special case 0, we don't want the delay the change
                        el.css(property, value);
                        setTimeout(function(){
                            defer.resolve();
                        }, 1);
                    } else {
                        el.delay(delay || 0, queueName).animate(properties, {duration: timeMs, easing: easing, queue: queueName,
                            done: function () {
                                el.css(property, value);
                                defer.resolve();
                            },
                            fail: function () {
                                defer.reject();
                            }
                        }).dequeue(queueName);
                    }
                }).promise();
            }
        },
        /**
         * Stops the current animation on el at a specific property
         * @param {jQuery} el element animating
         * @param {String} property css property we're animating
         * @returns {String} the current value for that property
         */
        stop: function(el, property) {
            var camelProperty = $.camelCase(property),
                currentValue = window.getComputedStyle(el[0]).getPropertyValue(property);
            el.stop('proganimate' + property, true);
            if (this._failPreviousTransition(el, camelProperty)) {
                el[0].style[camelProperty] = currentValue;
            }
            return currentValue;
        },
        _easingMap: {
            'easeInQuad': 'ease-in',
            'easeInSine': 'ease-in',
            'easeInCubic': 'ease-in',
            'easeInQuart': 'ease-in',
            'easeInQuint': 'ease-in',
            'easeInExpo': 'ease-in',
            'easeInCirc': 'ease-in',
            'easeInBack': 'ease-in',
            'easeInElastic': 'ease-in',
            'easeInBounce': 'ease-in',
            'easeOutQuad': 'ease-out',
            'easeOutSine': 'ease-out',
            'easeOutCubic': 'ease-out',
            'easeOutQuart': 'ease-out',
            'easeOutQuint': 'ease-out',
            'easeOutExpo': 'ease-out',
            'easeOutCirc': 'ease-out',
            'easeOutBack': 'ease-out',
            'easeOutElastic': 'ease-out',
            'easeOutBounce': 'ease-out',
            'easeInOutQuad': 'ease-in-out',
            'easeInOutSine': 'ease-in-out',
            'easeInOutCubic': 'ease-in-out',
            'easeInOutQuart': 'ease-in-out',
            'easeInOutQuint': 'ease-in-out',
            'easeInOutExpo': 'ease-in-out',
            'easeInOutCirc': 'ease-in-out',
            'easeInOutBack': 'ease-in-out',
            'easeInOutElastic': 'ease-in-out',
            'easeInOutBounce': 'ease-in-out',
            'swing': 'ease-in-out'
        },
        /**
         * Given either jquery easing or css easing, will convert to the correct value needed, or 'linear' if it can't figure it out
         * @param {String} easing - easing value, either jquery or css easing
         * @param {Boolean} tojQuery - whether we convert to jquery easing, or css easing
         * @returns {String}
         * @private
         */
        _normalizeEasing: function (easing, tojQuery) {
            var entry, easingMap = this._easingMap;
            easing = easing || 'linear';
            if (tojQuery) {
                easingMap = this._invert(easingMap);
            }
            entry = easingMap[easing];
            if (entry) {
                // jQuery turned into CSS Easing
                easing = entry;
            } else if (easing.indexOf('cubic-bezier') !== -1) {
                if (tojQuery) {
                    easing = 'swing';
                }
            } else if (!this._easingMap[easing]) {
                // don't know wtf this is
                easing = 'linear';
            }
            return easing;
        },
        /***************************
         * 2d Transition Code
         ***************************/
        _transition: function (el, property, camelProperty, toValue, timeMs, easing, delay) {
            var transitionProperty, transitionDeferred = $.Deferred(),
                fromValue = this._getCurrentValue(el, camelProperty, property);
            if (!this._shouldDoTransition(el, camelProperty, property, fromValue, toValue, timeMs)) {
                setTimeout(function(){
                    transitionDeferred.resolve();
                }, 1);
            } else {
                transitionProperty = property + ' ' + timeMs + 'ms ' + easing + ' ' + delay;
                transitionDeferred = this._doTransition(el, camelProperty, property, toValue, transitionProperty);
            }
            return transitionDeferred.promise();
        },
        /**
         * Begin the Transition
         * @param {jQuery} el - dom we're animation
         * @param {String} camelProperty - javascript style camel case property name
         * @param {String} property - property we're animating
         * @param {String} toValue - the value we're animating to
         * @param {String} transitionCss - transition css value we're using
         * @returns {Deferred}
         * @private
         */
        _doTransition: function (el, camelProperty, property, toValue, transitionCss) {
            var elStyle = el[0].style,
                _this = this;
            return this._getAnimationDeferred(el, camelProperty, property, '2d', function (defer) {
                _this._triggerTransition(defer, el, camelProperty, property, toValue, transitionCss);
            }).then(function() {
                // verify that we actually ended up where we wanted to end up so we don't accidentally call the wrong success handler
                if (toValue.replace(/[ ]+/g, '') === elStyle[camelProperty].replace(/[ ]+/g, '')) {
                    return $.Deferred().resolve();
                } else {
                    return $.Deferred().reject();
                }
            });
        },
        /**
         * Will attempt to fail any previous transition and trigger the next animation.
         * Also does setup and cleanup of the previous defer
         * @param {jQuery} el - dom we're animation
         * @param {String} camelProperty - javascript style camel case property name
         * @param {String} animationType - 2d vs 3d animation
         * @param {Function} triggerFunction - function that actually triggers the animation
         * @returns {Deferred}
         * @private
         */
        _getAnimationDeferred: function(el, camelProperty, transitionProperty, animationType, triggerFunction) {
            var _this = this;
            return $.Deferred(function (defer) {
                var failedTransition = _this._failPreviousTransition(el, camelProperty, true);
                // We delay the trigger to give firefox a chance to prepare itself for animation.
                // Without this, the animation sometimes never happens.
                setTimeout(function () {
                    // if we've failed a transition here, we've specifically said don't remove the transition
                    // styles to prevent the animation from jumping while we set up the next animation
                    // so we need to remove the transition here
                    if (failedTransition) {
                        failedTransition.cleanup();
                    }
                    if (defer.state() === 'pending') {
                        triggerFunction(defer);
                    }
                }, 20);
                el.data('transition-animate-' + camelProperty + '-defer', {
                    promise: defer,
                    animationType: animationType,
                    // this is here incase we mix and match 2d and 3d
                    // we want to make certain the correct cleanup function is called
                    cleanup: function(){
                        _this._removeTransition(el[0].style, transitionProperty);
                    }
                });
            }).always(function(skipRemoveTransition) {
                el.removeData('transition-animate-' + camelProperty + '-defer');
                // cleanup transition style, needs to happen first to force the browser
                // to recompute the final destination when we examine it
                if (!skipRemoveTransition) {
                    // we would skip the transition removal if we're changing values of the same property or changing it's timing
                    // the removal will happen later
                    _this._removeTransition(el[0].style, transitionProperty);
                }
            });
        },
        /**
         * Remove the transition value from the inputed string
         * @param {String} originalTransition - the original css transition style
         * @param {String} property the property we're animating that we'd like to remove
         * @returns {String} the originalTransition without the property
         * @private
         */
        _removeTransition: function(elStyle, property) {
            var originalTransition = elStyle[this.transitionCssName];
            originalTransition = originalTransition || '';
            originalTransition = originalTransition.replace(new RegExp(property + ' \\w+ [\\w-]+(\\s*\\([^\\)]*\\))?'), '');
            elStyle[this.transitionCssName] = $.trim(originalTransition.replace(/^[ ,]+/, '').replace(/[ ,]+$/, '').replace(/,[ ]+,/, ''));
        },
        _triggerTransition: function(defer, el, elProperty, transitionProperty, toValue, transitionCss) {
            var elStyle = el[0].style;
            this._registerTransitionEndListener(el, defer, transitionProperty);
            this._setupTransition(elStyle, transitionProperty, transitionCss);
            elStyle[elProperty] = toValue;
        },
        /**
         * If a transition exists on the camelProperty passed in, it'll reject the promise for it
         * @param {jQuery} el - element we're transitioning
         * @param {String} camelProperty - property we're transitioning
         * @param {Boolean} [skipRemoveTransition] - specifies if we should skip removing the transition css
         * @returns {{ promise: Deferred, reject: Function }} data object for the animation
         * @private
         */
        _failPreviousTransition: function(el, camelProperty, skipRemoveTransition) {
            var previousDefer = el.data('transition-animate-' + camelProperty + '-defer');
            if (previousDefer) {
                previousDefer.promise.reject(skipRemoveTransition);
                return previousDefer;
            }
        },
        _setupTransition: function(elStyle, transitionProperty, newTransitionCss) {
            // we need to remove any in progress transitions that we might have aborted
            var existingTransitionCss = elStyle[this.transitionCssName];
            if (existingTransitionCss) {
                existingTransitionCss += ',' + newTransitionCss;
            } else {
                existingTransitionCss = newTransitionCss;
            }
            elStyle[this.transitionCssName] = existingTransitionCss;
        },
        _getCurrentValue: function(el, camelProperty, property){
            var elStyle = el[0].style,
                value = elStyle[camelProperty] || el.css(property);
            if (value === 'auto' || !value) {
                // making the assumption that auto or no value is the equivalent of '0', cause browsers have issues animating from nothing to a value
                elStyle[camelProperty] = this._getCssNumber(camelProperty, 0);
                value = '0';
            }
            return value;
        },
        _shouldDoTransition: function(el, camelProperty, property, fromValue, toValue, timeMs) {
            var elStyle = el[0].style;
            if (timeMs === 0) {
                this._failPreviousTransition(el, camelProperty);
                elStyle[camelProperty] = toValue;
                return false;
            } else {
                if (!this._canAnimate(fromValue, toValue)) {
                    // weird edge case if we're already animating, but we've somehow triggered another animation
                    // going to the same value we're currently at. We need to kill the old animation to keep the universe
                    // consistent and abort all animations cause we're at the target property
                    this._failPreviousTransition(el, camelProperty);
                    return false;
                }
            }
            return fromValue;
        },
        /**
         * Answers the question about whether we can actually animate from one value to another
         * @param {String} fromValue - from value
         * @param {String} toValue - to value
         * @returns {Boolean}
         * @private
         */
        _canAnimate: function(fromValue, toValue) {
            //check for fromValue 0 (unitless), toValue 0 (unitless)
            if (fromValue.replace(/[ a-z%]+/g, '') === '0' && toValue.replace(/[ a-z%]+/g, '') === '0') {
                return false;
            }
            return fromValue.replace(/[ ]/g, '') !== toValue.replace(/[ ]/g, '');
        },
        /***************************
         * Generic Transition Helpers
         ***************************/
        /**
         * Given a number or string, will return a string version with units
         * @param {String} camelProperty - javascript style camel case property name
         * @param {String|Number} toValue - value that might need units added
         * @returns {String} toValue with units
         * @private
         */
        _getCssNumber: function (camelPropertyName, toValue) {
            if (!$.cssNumber[camelPropertyName]) {
                // check for raw numbers, or strings lacking units to auto add pixels
                if (this._isNumber(toValue) || !toValue.match(/[a-z%]/)) {
                    return toValue + 'px';
                }
            }
            return toValue + '';
        },
        _registerTransitionEndListener: function ($el, deferred, propertyName) {
            if (this.transitionEndName) {
                var el = $el[0],
                    transitionEndName = this.transitionEndName,
                    transitionEndFunc = function transitionEnd(e){
                        // propertyName is optional
                        if (e.target === el && (!propertyName || e.propertyName === propertyName)) {
                            this.removeEventListener(transitionEndName, transitionEndFunc);
                            deferred.resolve();
                            transitionEndFunc = null;
                        }
                    };
                el.addEventListener(transitionEndName, transitionEndFunc);
                return deferred.promise();
            } else {
                return $.Deferred.reject();
            }
        },
        _invert: function(obj) {
            var result = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)){
                    result[obj[key]] = key;
                }
            }
            return result;
        },
        _isNumber: function(obj){
            return Object.prototype.toString.call(obj) === '[object Number]';
        },
        _isDocumentHidden: function() {
            return document.hidden || document.webkitHidden || document.mozHidden || document.msHidden || document.oHidden;
        }
    };
    return new CSSAnimate(getPrefixed('transition'));
}));
