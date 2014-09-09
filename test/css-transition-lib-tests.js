(function ($, QUnit, CSSAnimate) {
    "use strict";
    var slow = 100;
    var fast = 60;
    var $qunitFixture = $('#qunit-fixture');
    var originalCssName = CSSAnimate.transitionCssName;

    QUnit.module('CSS Transition Tests', {
        teardown: function () {
            // need both for phantomjs
            $qunitFixture.attr('style', '');
            $qunitFixture.removeAttr('style');
            CSSAnimate.transitionCssName = originalCssName;
        }
    });

    var checkAnimation = function (title, usejQuery, asyncTest, property, from, to, time, easing) {
        if (time === undefined) {
            time = fast;
        }
        if (easing === undefined) {
            easing = 'linear';
        }
        var funcName = asyncTest ? 'asyncTest': 'test';
        QUnit[funcName](title + ': ' + property + ' from ' + from + ' to ' + to + ' in ' + time + 'ms with ' + easing, function () {
            QUnit.expect(1);
            easing = easing || 'linear';
            $qunitFixture.css({position: 'absolute'});
            $qunitFixture.css(property, from);
            if (usejQuery) {
                CSSAnimate.transitionCssName = null;
            }
            if (!asyncTest) {
                document.oHidden = true;
            }
            CSSAnimate.animate($qunitFixture, property, to, time, easing).done(function () {
                QUnit.equal(
                    $qunitFixture[0].style[$.camelCase(property)].replace(/[ ]+/g, ''),
                    CSSAnimate._getCssNumber($.camelCase(property), to).replace(/[ ]+/g, ''),
                    'Element ended up at destination style'
                );
                if (!asyncTest) {
                    document.oHidden = false;
                }
            }).fail(function () {
                QUnit.ok(false, 'single animation failed');
            }).always(function () {
                if (asyncTest) {
                    QUnit.start();
                }
            });
        });
    };

    var checkMultiDivAnimation = function (title, usejQuery, asyncTest, property, from, to, time, easing) {
        if (time === undefined) {
            time = fast;
        }
        if (easing === undefined) {
            easing = 'linear';
        }
        var funcName = asyncTest ? 'asyncTest': 'test';
        QUnit[funcName](title + ': multiple DIVs ' + property + ' from ' + from + ' to ' + to + ' in ' + time + 'ms with ' + easing, function () {
            easing = easing || 'linear';
            var css = {position: 'absolute'};
            css[property] = from;
            $qunitFixture.append("<div class='checkMultiDivAnimation'></div><div class='checkMultiDivAnimation'></div><div class='checkMultiDivAnimation'></div>" );
            QUnit.expect(3);
            if (usejQuery) {
                CSSAnimate.transitionCssName = null;
            }
            if (!asyncTest) {
                document.oHidden = true;
            }
            var selectList = $(".checkMultiDivAnimation");
            selectList.css(css);
            CSSAnimate.animate(selectList, property, to, time, easing).done(function () {
                    selectList.each( function(index, element){
                        QUnit.equal(
                            element.style[$.camelCase(property)],
                            CSSAnimate._getCssNumber($.camelCase(property), to),
                            'Element ' + index + ' ended up at destination style'
                        );
                    });
                if (!asyncTest) {
                    document.oHidden = false;
                }
            }).fail(function () {
                QUnit.ok(false, 'single animation of multiple DIVs failed');
            }).always(function () {
                if (asyncTest){
                    QUnit.start();
                }
            });
        });
    };

    var checkMultipleAnimations = function (title, usejQuery, asyncTest, delay, property1, from1, to1, time1, property2, from2, to2, time2, easing) {
        if (time1 === undefined) {
            time1 = fast;
        }
        if (time2 === undefined) {
            time2 = fast;
        }
        if (easing === undefined) {
            easing = 'linear';
        }
        var funcName = asyncTest ? 'asyncTest' : 'test';
        QUnit[funcName](title + '-MULTI (delay ' + delay + 'ms): ' + property1 + ' from ' + from1 + ' to ' + to1 + ' in ' + time1 + 'ms/' + property2 + ' from ' + from2 + ' to ' + to2 + ' in ' + time2 + 'ms with ' + easing, function () {
            easing = easing || 'linear';
            $qunitFixture.css({position: 'absolute'});
            $qunitFixture.css(property1, from1);
            if (usejQuery) {
                CSSAnimate.transitionCssName = null;
            }
            if (!asyncTest) {
                document.oHidden = true;
                CSSAnimate.animate($qunitFixture, property1, to1, time1, easing);
                CSSAnimate.animate($qunitFixture, property2, to2, time2, easing);
                if (property1 !== property2) {
                    QUnit.expect(2);
                    QUnit.equal(
                        $qunitFixture[0].style[$.camelCase(property1)],
                        CSSAnimate._getCssNumber($.camelCase(property1), to1),
                        '1st Transition RESOLVED'
                    );
                    QUnit.equal(
                        $qunitFixture[0].style[$.camelCase(property2)],
                        CSSAnimate._getCssNumber($.camelCase(property2), to2),
                        '2nd Transition RESOLVED'
                    );
                } else {
                    QUnit.expect(1);
                    QUnit.equal(
                        $qunitFixture[0].style[$.camelCase(property2)],
                        CSSAnimate._getCssNumber($.camelCase(property2), to2),
                        '2nd Transition RESOLVED'
                    );
                }
                document.oHidden = false;
            } else {
                QUnit.expect(2);
                var firstAnimPromise = CSSAnimate.animate($qunitFixture, property1, to1, time1, easing);
                setTimeout(function () {
                    CSSAnimate.animate($qunitFixture, property2, to2, time2, easing).done(function () {
                        if (time1 === 0) {
                            firstAnimPromise.always(function(){
                                QUnit.equal(firstAnimPromise.state(), 'resolved', '1st Transition should succeed if time1 = 0');
                            });
                        } else {
                            // interactions
                            if (property1 === property2) {
                                QUnit.equal(firstAnimPromise.state(), 'rejected', '1st Transition REJECTED');
                            } else {
                                firstAnimPromise.done(function () {
                                    var actual1 = $qunitFixture[0].style[$.camelCase(property1)];
                                    if (property1 === 'opacity') {
                                        actual1 = Math.round(actual1 * 100.0) / 100.0;
                                    }
                                    QUnit.equal(
                                        actual1,
                                        CSSAnimate._getCssNumber($.camelCase(property1), to1),
                                        '1st Transition RESOLVED to it\'s destination value'
                                    );
                                });
                            }
                        }
                        // second animation should always win
                        var actual2 = $qunitFixture[0].style[$.camelCase(property2)];
                        if (property2 === 'opacity') {
                            actual2 = Math.round(actual2 * 100.0) / 100.0;
                        }
                        QUnit.equal(
                            actual2,
                            CSSAnimate._getCssNumber($.camelCase(property2), to2),
                            '2nd Transition RESOLVED'
                        );
                        firstAnimPromise.always(function () {
                            QUnit.start();
                        });
                    }).fail(function(){
                        QUnit.ok(false, 'second animation failed');
                        if (asyncTest) {
                            QUnit.start();
                        }
                    });
                }, delay);
            }
        });
    };

    var interruptCssOnlyAnimationTest = function(title, animOptions, asyncTest, property, from, to, time, interruptValue){
        if (!asyncTest) {
            // this is an async only test
            return;
        }
        QUnit.asyncTest(title + ' (Interrupt CSS Only): ' + property + ' from ' + from + ' to ' + to + ' in ' + time + 'ms', function () {
            $qunitFixture.css({position: 'absolute'});
            $qunitFixture.css(property, from);
            QUnit.expect(1);
            CSSAnimate.animate($qunitFixture, property, to, time).done(function () {
                QUnit.ok(false, 'animation should not have completed successfully');
            }).fail(function () {
                QUnit.ok(true, 'animation should fail when interrupted');
            }).always(function () {
                QUnit.start();
            });
            setTimeout(function(){
                // jquery animate doesn't support interrupting animations this way, so we fudge the tests
                $qunitFixture.stop('proganimate' + property, true);
                $qunitFixture.css(property, interruptValue);
            }, 25);
        });
    };

    var checkConflictingAnimations = function(title, usejQuery, asyncTest, delay){
        // conflicting animations, 3d transform version, different destinations
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'left', 110, 120, fast, 'easeOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'left', 110, 120, slow, 'easeInOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 120, fast, 'easeInElastic');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 120, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 120, fast, 'easeInOutBack');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 120, slow, 'easeInQuad');
        // conflicting upgradable transitions, multiple 3d transforms
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'top', 110, 120, fast, 'easeOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'top', 110, 120, slow, 'easeInOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'top', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'top', 110, 120, fast, 'easeInElastic');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'top', 110, 120, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'top', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'top', 110, 120, fast, 'easeInOutBack');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'top', 110, 120, slow, 'easeInQuad');
        // conflicting upgradable transitions, multiple 3d transforms
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, 0, 'left', 110, 120, fast, 'easeOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, 0, 'left', 110, 120, slow, 'easeInOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, slow, 'left', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, slow, 'left', 110, 120, fast, 'easeInElastic');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, slow, 'left', 110, 120, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, fast, 'left', 110, 120, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, fast, 'left', 110, 120, fast, 'easeInOutBack');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'top', 110, 10, fast, 'left', 110, 120, slow, 'easeInQuad');
        // conflicting animations, 3d transform version, same destinations
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'left', 110, 10, fast, 'easeInOutExpo');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, 0, 'left', 110, 10, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 10, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 10, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, slow, 'left', 110, 10, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 10, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 10, fast, 'easeOutBack');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'left', 110, 10, fast, 'left', 110, 10, slow, 'ease-out');
        // conflicting animations, 2d transition version, different destinations
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, 0, 'opacity', 1, 0.50, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, 0, 'opacity', 1, 0.50, fast, 'easeOutCubic');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.50, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.50, slow, 'easeInOutCubic');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.50, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.50, 0, 'bad easing!');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.50, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.50, fast, 'easeInQuad');
        // conflicting animations, 2d transition version, same destination
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, 0, 'opacity', 1, 0.20, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, 0, 'opacity', 1, 0.20, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.20, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.20, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, slow, 'opacity', 1, 0.20, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.20, 0, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.20, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, delay, 'opacity', 1, 0.20, fast, 'opacity', 1, 0.20, fast, 'bad easing!');
    };

    var runAnimationTests = function (title, usejQuery, asyncTest) {
        checkAnimation(title, usejQuery, asyncTest, 'left', 0, 70);
        checkAnimation(title, usejQuery, asyncTest, 'left', 0, 1020, fast, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', 55, 0, fast, 'bad easing!');
        checkAnimation(title, usejQuery, asyncTest, 'left', '200px', '100px', slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '2000px', '100px', 0, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'top', '200%', '0px', 0, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '2%', '100%', slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '20%', '100%', 0, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '10%', '100px', 0, 'easeInBack');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100%', 100, slow, 'easeOutBack');
        checkAnimation(title, usejQuery, asyncTest, 'left', '10px', 100, slow, 'easeInOutQuint');
        checkAnimation(title, usejQuery, asyncTest, 'left', 0, 0, slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', 'auto', 0, slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', 'auto', 100, slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'height', '100px', 40, slow, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '0px', 0, slow, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100%', 40, fast, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'width', '100px', 0, slow, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', 100, 0, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', 100, 0, slow, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'top', '100px', fast, fast, '');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, '!@#$%^&*()');
        checkAnimation(title, usejQuery, asyncTest, 'left', 0, 0, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '0px', 0, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100%', 40, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100%', 0, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, 'cubic-bezier(.42,0,1,.1)');
        checkAnimation(title, usejQuery, asyncTest, 'left', 100, 0, 115, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(55, 132, 102)', 'rgb(15, 12, 102)');
        checkAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(55, 132, 102)', 'rgb(15,12,102)');
        checkAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(15, 12, 102)', 'rgb(15, 12, 102)', 'cubic-bezier(.42,0,1,.1)');
        checkAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(155, 12, 102)', 'rgb(15, 132, 102)', 0, '!@#$%^&*()');
        checkAnimation(title, usejQuery, asyncTest, 'background-color', "rgb(15, 102, 12)", 'rgb(15, 102, 12)', 0);
        checkAnimation(title, usejQuery, asyncTest, 'opacity', 0, 1, fast, 'ease-in-out');
        checkAnimation(title, usejQuery, asyncTest, 'opacity', 1, 0.50, slow, 'cubic-bezier(.42,0,1,.1)');
        checkAnimation(title, usejQuery, asyncTest, 'opacity', 0.10, 1, 0, 'cubic-bezier(.42,0,1,.1)');
        checkAnimation(title, usejQuery, asyncTest, 'opacity', 0.60, 1, slow, 'ease-out');
        checkAnimation(title, usejQuery, asyncTest, 'opacity', 0.99, 0);
        interruptCssOnlyAnimationTest(title, usejQuery, asyncTest, 'left', 0, 100, fast, 50);
        interruptCssOnlyAnimationTest(title, usejQuery, asyncTest, 'height', 0, 100, fast, 50);
        interruptCssOnlyAnimationTest(title, usejQuery, asyncTest, 'height', 0, '100%', fast, 50);
        interruptCssOnlyAnimationTest(title, usejQuery, asyncTest, 'opacity', 0, 0.5, fast, 1);
        interruptCssOnlyAnimationTest(title, usejQuery, asyncTest, 'background-color', 'rgb(55, 132, 102)', 'rgb(15, 12, 102)', fast, 'rgb(200, 200, 200)');
        // interactions of 2 different properties, fast vs slow or slow vs fast, 2d and 3d transform
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'opacity', 0, 0.1, slow, 'left', 110, 10, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'opacity', 0, 0.1, fast, 'left', 110, 10, slow, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'left', 110, 10, slow, 'opacity', 0, 0.1, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'left', 110, 10, fast, 'opacity', 0, 0.1, slow, 'ease-out');
        // interactions of 2 different properties, fast vs slow or slow vs fast, 2d transition only
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'opacity', 0, 0.1, slow, 'height', 110, 10, fast, 'ease-out');
        checkMultipleAnimations(title, usejQuery, asyncTest, 0, 'opacity', 0, 0.1, fast, 'height', 110, 10, slow, 'ease-out');
        checkConflictingAnimations(title, usejQuery, asyncTest, 0);
        checkConflictingAnimations(title, usejQuery, asyncTest, 25);
        // multiple div animations
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 0, 70);
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 0, 1020, fast, 'easeInSine');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 55, 0, fast, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '200px', '100px', slow, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '2000px', '100px', 0, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'top', '200%', '0px', 0, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '2%', '100%', slow, 'easeInOutQuart');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '20%', '100%', 0, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '10%', '100px', 0, 'bad easing!');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100%', 100, slow, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '10px', 100, slow, 'bad easing!');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 0, 0, slow, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'height', '100px', 40, slow, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '0px', 0, slow, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100%', 40, fast, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'width', '100px', 0, slow, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 100, 0, fast, 'easeInOutBack');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 100, 0, slow, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'top', '100px', fast, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 0, 0, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '0px', 0, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100%', 40, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100%', 0, fast, 'ease-in-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', '100px', 0, fast, 'cubic-bezier(.42,0,1,.1)');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'left', 100, 0, 115, 'bad easing!');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(55, 132, 102)', 'rgb(15, 12, 102)');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(15, 12, 102)', 'rgb(15, 12, 102)', 'cubic-bezier(.42,0,1,.1)');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'background-color', 'rgb(155, 12, 102)', 'rgb(15, 132, 102)', 0);
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'background-color', "rgb(15, 102, 12)", 'rgb(15, 102, 12)', 0);
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'opacity', 0, 1, fast, 'easeInOutBounce');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'opacity', 1, 0.50, slow, 'cubic-bezier(.42,0,1,.1)');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'opacity', 0.10, 1, 0, 'cubic-bezier(.42,0,1,.1)');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'opacity', 0.60, 1, slow, 'ease-out');
        checkMultiDivAnimation(title, usejQuery, asyncTest, 'opacity', 0.99, 0);
    };

    runAnimationTests('2D Transition Tests', false, true);
    runAnimationTests('jQuery Tests', true, true);
    runAnimationTests('2D Transition Tests with document Hidden', false, false);
    runAnimationTests('jQuery Tests with document Hidden', true, false);
})(window.jQuery, window.QUnit, window.CSSAnimate);
