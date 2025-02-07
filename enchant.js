/**
 * enchant.js v0.5.2
 *
 * Copyright (c) Ubiquitous Entertainment Inc.
 * Dual licensed under the MIT or GPL Version 3 licenses
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

if (typeof Object.defineProperty !== 'function') {
    Object.defineProperty = function(obj, prop, desc) {
        if ('value' in desc) {
            obj[prop] = desc.value;
        }
        if ('get' in desc) {
            obj.__defineGetter__(prop, desc.get);
        }
        if ('set' in desc) {
            obj.__defineSetter__(prop, desc.set);
        }
        return obj;
    };
}
if (typeof Object.defineProperties !== 'function') {
    Object.defineProperties = function(obj, descs) {
        for (var prop in descs) {
            if (descs.hasOwnProperty(prop)) {
                Object.defineProperty(obj, prop, descs[prop]);
            }
        }
        return obj;
    };
}
if (typeof Object.create !== 'function') {
    Object.create = function(prototype, descs) {
        function F() {
        }

        F.prototype = prototype;
        var obj = new F();
        if (descs != null){
            Object.defineProperties(obj, descs);
        }
        return obj;
    };
}
if (typeof Object.getPrototypeOf !== 'function') {
    Object.getPrototypeOf = function(obj) {
        return obj.__proto__;
    };
}

if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = function(thisObject) {
        var func = this;
        var args = Array.prototype.slice.call(arguments, 1);
        var Nop = function() {
        };
        var bound = function() {
            var a = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(
                this instanceof Nop ? this : thisObject || window, a);
        };
        Nop.prototype = func.prototype;
        bound.prototype = new Nop();
        return bound;
    };
}

/**
 * Export library classes globally.
 *
 * When no arguments are delivered, all classes defined in enchant.js as well as all classes defined in
 * plugins will be exported. When more than one argument is delivered, by default only classes defined
 * in enchant.js will be exported. When you wish to export plugin classes you must explicitly deliver  *  * plugin identifiers as arguments.
 *
 * @example
 *   enchant();     // All classes will be exported.
 *   enchant('');   // Only classes in enchant.js will be exported.
 *   enchant('ui'); // enchant.js classes and ui.enchant.js classes will be exported.
 *
 * @param {...String} [modules] Export module. Multiple designations possible.
 */
var enchant = function(modules) {
    if (modules != null) {
        if (!(modules instanceof Array)) {
            modules = Array.prototype.slice.call(arguments);
        }
        modules = modules.filter(function(module) {
            return [module].join();
        });
    }
    (function include(module, prefix) {
        var submodules = [],
            i, len;
        for (var prop in module){
            if (module.hasOwnProperty(prop)) {
                if (typeof module[prop] === 'function') {
                    window[prop] = module[prop];
                } else if (typeof module[prop] === 'object' && Object.getPrototypeOf(module[prop]) === Object.prototype) {
                    if (modules == null) {
                        submodules.push(prop);
                    } else {
                        i = modules.indexOf(prefix + prop);
                        if (i !== -1) {
                            submodules.push(prop);
                            modules.splice(i, 1);
                        }
                    }
                }
            }
        }

        for (i = 0, len = submodules.length; i < len; i++) {
            include(module[submodules[i]], prefix + submodules[i] + '.');
        }
    }(enchant, ''));

    if (modules != null && modules.length) {
        throw new Error('Cannot load module: ' + modules.join(', '));
    }
};

window.addEventListener("message", function(msg, origin) {
    try {
        var data = JSON.parse(msg.data);
        if (data.type === "event") {
            enchant.Game.instance.dispatchEvent(new enchant.Event(data.value));
        } else if (data.type === "debug") {
            switch (data.value) {
                case "start":
                    enchant.Game.instance.start();
                    break;
                case "pause":
                    enchant.Game.instance.pause();
                    break;
                case "resume":
                    enchant.Game.instance.resume();
                    break;
                case "tick":
                    enchant.Game.instance._tick();
                    break;
                default:
                    break;
            }
        }
    } catch (e) {
        // ignore
    }
}, false);

/**
 * Class Classes
 *
 * @param {Function} [superclass] Successor class.
 * @param {*} definition Class definition.
 * @constructor
 */
enchant.Class = function(superclass, definition) {
    return enchant.Class.create(superclass, definition);
};

/**
 * Create class.
 *
 * When making classes that succeed other classes, the previous class is used as a base with
 * constructor as default. In order to override the constructor, it is necessary to explicitly
 * call up the previous constructor to use it.
 *
 * @example
 *   var Ball = Class.create({ // Creates independent class.
 *       initialize: function(radius) { ... }, // Method definition.
 *       fall: function() { ... }
 *   });
 *
 *   var Ball = Class.create(Sprite);  // Creates a class succeeding "Sprite"
 *   var Ball = Class.create(Sprite, { // Creates a class succeeding "Sprite"
 *       initialize: function(radius) { // Overwrites constructor
 *          Sprite.call(this, radius*2, radius*2); // Applies previous constructor.
 *          this.image = game.assets['ball.gif'];
 *       }
 *   });
 *
 * @param {Function} [superclass] Preceding class.
 * @param {*} [definition] Class definition.
 * @static
 */
enchant.Class.create = function(superclass, definition) {
    if (superclass == null){
        throw new Error("superclass is undefined");
    }
    if (arguments.length === 0) {
        return enchant.Class.create(Object, definition);
    } else if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        return enchant.Class.create(Object, arguments[0]);
    }

    for (var prop in definition){
        if (definition.hasOwnProperty(prop)) {
            if (typeof definition[prop] === 'object' && Object.getPrototypeOf(definition[prop]) === Object.prototype) {
                if (!('enumerable' in definition[prop])){
                    definition[prop].enumerable = true;
                }
            } else {
                definition[prop] = { value: definition[prop], enumerable: true, writable: true };
            }
        }
    }
    var Constructor = function() {
        if (this instanceof Constructor) {
            Constructor.prototype.initialize.apply(this, arguments);
        } else {
            return new Constructor();
        }
    };
    Constructor.prototype = Object.create(superclass.prototype, definition);
    Constructor.prototype.constructor = Constructor;
    if (Constructor.prototype.initialize == null) {
        Constructor.prototype.initialize = function() {
            superclass.apply(this, arguments);
        };
    }

    return Constructor;
};
/**
 */
enchant.ENV = {
    /**
     * css vendor prefix in current browser
     * @type {String}
     */
    VENDOR_PREFIX: (function() {
        var ua = navigator.userAgent;
        if (ua.indexOf('Opera') !== -1) {
            return 'O';
        } else if (ua.indexOf('MSIE') !== -1) {
            return 'ms';
        } else if (ua.indexOf('WebKit') !== -1) {
            return 'webkit';
        } else if (navigator.product === 'Gecko') {
            return 'Moz';
        } else {
            return '';
        }
    }()),
    /**
     * CSS vendor prefix in current browser
     * @type {String}
     */
    TOUCH_ENABLED: (function() {
        var div = document.createElement('div');
        div.setAttribute('ontouchstart', 'return');
        return typeof div.ontouchstart === 'function';
    }()),
    MOUSE_ENABLED: true,
    /**
     * Is this browser iPhone with Retina display?
     * @type {String}
     */
    RETINA_DISPLAY: (function() {
        if (navigator.userAgent.indexOf('iPhone') !== -1 && window.devicePixelRatio === 2) {
            var viewport = document.querySelector('meta[name="viewport"]');
            if (viewport == null) {
                viewport = document.createElement('meta');
                document.head.appendChild(viewport);
            }
            viewport.setAttribute('content', 'width=640');
            return true;
        } else {
            return false;
        }
    }()),
    /**
     * Will Use Flash instead of native Audio class?
     * @type {String}
     */
    USE_FLASH_SOUND: (function() {
        var ua = navigator.userAgent;
        var vendor = navigator.vendor || "";
        return (location.href.indexOf('http') === 0 && ua.indexOf('Mobile') === -1 && vendor.indexOf('Apple') !== -1);
    }()),
    /**
     * On click/touch event in these tags, setPreventDefault() will not be called
     */
    USE_DEFAULT_EVENT_TAGS: ['input', 'textarea', 'select', 'area'],
    CANVAS_DRAWING_METHODS: [
        'putImageData', 'drawImage', 'drawFocusRing', 'fill', 'stroke',
        'clearRect', 'fillRect', 'strokeRect', 'fillText', 'strokeText'
    ],
    KEY_BIND_TABLE: {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    },
    PREVENT_DEFAULT_KEY_CODES: [37, 38, 39, 40, 32],
    /**
     * @type {Boolean}
     */
    SOUND_ENABLED_ON_MOBILE_SAFARI: false
};
/**
 * @scope enchant.Event.prototype
 */
enchant.Event = enchant.Class.create({
    /**
     * A class for independent event implementation like DOM Events.
     * However, does not include phase concept.
     * @param {String} type Event type.
     * @constructs
     */
    initialize: function(type) {
        /**
         * Event type.
         * @type {String}
         */
        this.type = type;
        /**
         * Event target.
         * @type {*}
         */
        this.target = null;
        /**
         * Event occurrence's x coordinates.
         * @type {Number}
         */
        this.x = 0;
        /**
         * Event occurrence's y coordinates.
         * @type {Number}
         */
        this.y = 0;
        /**
         * X coordinates for event occurrence standard event-issuing object.
         * @type {Number}
         */
        this.localX = 0;
        /**
         * Y coordinates for event occurrence standard event-issuing object.
         * @type {Number}
         */
        this.localY = 0;
    },
    _initPosition: function(pageX, pageY) {
        var game = enchant.Game.instance;
        this.x = this.localX = (pageX - game._pageX) / game.scale;
        this.y = this.localY = (pageY - game._pageY) / game.scale;
    }
});

/**
 * Event activated upon completion of game loading.
 *
 * It is necessary to wait for loading to finish and to do initial processing when preloading images.
 * Issued object: enchant.Game
 *
 * @example
 *   var game = new Game(320, 320);
 *   game.preload('player.gif');
 *   game.onload = function() {
 *      ... // Describes initial game processing
 *   };
 *   game.start();
 *
 * @type {String}
 */
enchant.Event.LOAD = 'load';

/**
 * Events occurring during game loading.
 * Activated each time a preloaded image is loaded. Issued object: enchant.Game
 * @type {String}
 */
enchant.Event.PROGRESS = 'progress';

/**
 * Events occurring during frame start.
 * Issued object: enchant.Game, enchant.Node
 * @type {String}
 */
enchant.Event.ENTER_FRAME = 'enterframe';

/**
 * Events occurring during frame end.
 * Issued object: enchant.Game
 * @type {String}
 */
enchant.Event.EXIT_FRAME = 'exitframe';

/**
 * Events occurring during Scene beginning.
 * Issued object: enchant.Scene
 * @type {String}
 */
enchant.Event.ENTER = 'enter';

/**
 * Events occurring during Scene end.
 * Issued object: enchant.Scene
 * @type {String}
 */
enchant.Event.EXIT = 'exit';

/**
 * Event occurring when Node is added to Group.
 * Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.ADDED = 'added';

/**
 * Event occurring when Node is added to Scene.
 * Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.ADDED_TO_SCENE = 'addedtoscene';

/**
 * Event occurring when Node is deleted from Group.
 * Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.REMOVED = 'removed';

/**
 * Event occurring when Node is deleted from Scene.
 * Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.REMOVED_FROM_SCENE = 'removedfromscene';

/**
 * Event occurring when touch corresponding to Node has begun.
 * Click is also treated as touch. Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.TOUCH_START = 'touchstart';

/**
 * Event occurring when touch corresponding to Node has been moved.
 * Click is also treated as touch. Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.TOUCH_MOVE = 'touchmove';

/**
 * Event occurring when touch corresponding to touch has ended.
 * Click is also treated as touch. Issued object: enchant.Node
 * @type {String}
 */
enchant.Event.TOUCH_END = 'touchend';

/**
 * Event occurring when Entity is rendered.
 * Issued object: enchant.Entity
 * @type {String}
 */
enchant.Event.RENDER = 'render';

/**
 * Event occurring when button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.INPUT_START = 'inputstart';

/**
 * Event occurring when button input changes.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.INPUT_CHANGE = 'inputchange';

/**
 * Event occurring when button input ends.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.INPUT_END = 'inputend';

/**
 * Event occurring when left button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.LEFT_BUTTON_DOWN = 'leftbuttondown';

/**
 * Event occurring when left button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.LEFT_BUTTON_UP = 'leftbuttonup';

/**
 * Event occurring when right button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.RIGHT_BUTTON_DOWN = 'rightbuttondown';

/**
 * Event occurring when right button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.RIGHT_BUTTON_UP = 'rightbuttonup';

/**
 * Even occurring when up button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.UP_BUTTON_DOWN = 'upbuttondown';

/**
 * Event occurring when up button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.UP_BUTTON_UP = 'upbuttonup';

/**
 * Event occurring when down button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.DOWN_BUTTON_DOWN = 'downbuttondown';

/**
 * Event occurring when down button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.DOWN_BUTTON_UP = 'downbuttonup';

/**
 * Event occurring when a button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.A_BUTTON_DOWN = 'abuttondown';

/**
 * Event occurring when a button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.A_BUTTON_UP = 'abuttonup';

/**
 * Event occurring when b button is pushed.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.B_BUTTON_DOWN = 'bbuttondown';

/**
 * Event occurring when b button is released.
 * Issued object: enchant.Game, enchant.Scene
 * @type {String}
 */
enchant.Event.B_BUTTON_UP = 'bbuttonup';

/**
 * @scope enchant.EventTarget.prototype
 */
enchant.EventTarget = enchant.Class.create({
    /**
     * A class for independent event implementation like DOM Events.
     * However, does not include phase concept.
     * @constructs
     */
    initialize: function() {
        this._listeners = {};
    },
    /**
     * Add EventListener.
     * @param {String} type Event type.
     * @param {function(e:enchant.Event)} listener EventListener added.
     */
    addEventListener: function(type, listener) {
        var listeners = this._listeners[type];
        if (listeners == null) {
            this._listeners[type] = [listener];
        } else if (listeners.indexOf(listener) === -1) {
            listeners.unshift(listener);

        }
    },
    /**
     * Synonym for addEventListener
     * @param {String} type Event type.
     * @param {function(e:enchant.Event)} listener EventListener added.
     */
    on: function() {
        this.addEventListener.apply(this, arguments);
    },
    /**
     * Delete EventListener.
     * @param {String} type Event type.
     * @param {function(e:enchant.Event)} listener EventListener deleted.
     */
    removeEventListener: function(type, listener) {
        var listeners = this._listeners[type];
        if (listeners != null) {
            var i = listeners.indexOf(listener);
            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    },
    /**
     * Clear EventListener.
     * @param {String} type Event type.
     */
    clearEventListener: function(type) {
        if (type != null) {
            delete this._listeners[type];
        } else {
            this._listeners = {};
        }
    },
    /**
     * Issue event.
     * @param {enchant.Event} e Event issued.
     */
    dispatchEvent: function(e) {
        e.target = this;
        e.localX = e.x - this._offsetX;
        e.localY = e.y - this._offsetY;
        if (this['on' + e.type] != null){
            this['on' + e.type](e);
        }
        var listeners = this._listeners[e.type];
        if (listeners != null) {
            listeners = listeners.slice();
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(this, e);
            }
        }
    }
});

/**
 * @scope enchant.Game.prototype
 */

(function() {
    var game;

    /**
     * @scope enchant.Game.prototype
     */
    enchant.Game = enchant.Class.create(enchant.EventTarget, {
        /**
         * Class controlling game main loop, scene.
         *
         * There can be only one instance, and when the constructor is executed
         * with an instance present, the existing item will be overwritten. The existing instance
         * can be accessed from enchant.Game.instance.
         *
         * @param {Number} width Game screen width.
         * @param {Number} height Game screen height.
         * @constructs
         * @extends enchant.EventTarget
         */
        initialize: function(width, height) {
            if (window.document.body === null) {
                throw new Error("document.body is null. Please excute 'new Game()' in window.onload.");
            }

            enchant.EventTarget.call(this);
            var initial = true;
            if (game) {
                initial = false;
                game.stop();
            }
            game = enchant.Game.instance = this;

            /**
             * Game screen width.
             * @type {Number}
             */
            this.width = width || 320;
            /**
             * Game screen height.
             * @type {Number}
             */
            this.height = height || 320;
            /**
             * Game display scaling.
             * @type {Number}
             */
            this.scale = 1;

            var stage = document.getElementById('enchant-stage');
            if (!stage) {
                stage = document.createElement('div');
                stage.id = 'enchant-stage';
                stage.style.width = window.innerWidth + 'px';
                stage.style.height = window.innerHeight + 'px';
                stage.style.position = 'absolute';
                if (document.body.firstChild) {
                    document.body.insertBefore(stage, document.body.firstChild);
                } else {
                    document.body.appendChild(stage);
                }
                this.scale = Math.min(
                    window.innerWidth / this.width,
                    window.innerHeight / this.height
                );
                this._pageX = 0;
                this._pageY = 0;
            } else {
                var style = window.getComputedStyle(stage);
                width = parseInt(style.width, 10);
                height = parseInt(style.height, 10);
                if (width && height) {
                    this.scale = Math.min(
                        width / this.width,
                        height / this.height
                    );
                } else {
                    stage.style.width = this.width + 'px';
                    stage.style.height = this.height + 'px';
                }
                while (stage.firstChild) {
                    stage.removeChild(stage.firstChild);
                }
                stage.style.position = 'relative';
                var bounding = stage.getBoundingClientRect();
                this._pageX = Math.round(window.scrollX + bounding.left);
                this._pageY = Math.round(window.scrollY + bounding.top);
            }
            if (!this.scale) {
                this.scale = 1;
            }
            stage.style.fontSize = '12px';
            stage.style.webkitTextSizeAdjust = 'none';
            this._element = stage;

            /**
             * Game frame rate.
             * @type {Number}
             */
            this.fps = 30;
            /**
             * Number of frames from game start.
             * @type {Number}
             */
            this.frame = 0;
            /**
             * Game executability (valid or not).
             * @type {Boolean}
             */
            this.ready = null;
            /**
             * Game execution state (valid or not).
             * @type {Boolean}
             */
            this.running = false;
            /**
             * Object saved as loaded image path key.
             * @type {Object.<String, Surface>}
             */
            this.assets = {};
            var assets = this._assets = [];
            (function detectAssets(module) {
                if (module.assets instanceof Array) {
                    [].push.apply(assets, module.assets);
                }
                for (var prop in module) {
                    if (module.hasOwnProperty(prop)) {
                        if (typeof module[prop] === 'object' && Object.getPrototypeOf(module[prop]) === Object.prototype) {
                            detectAssets(module[prop]);
                        }
                    }
                }
            }(enchant));

            this._scenes = [];
            /**
             * Current Scene. Scene at top of Scene stack.
             * @type {enchant.Scene}
             */
            this.currentScene = null;
            /**
             * Route Scene. Scene at bottom of Scene stack.
             * @type {enchant.Scene}
             */
            this.rootScene = new enchant.Scene();
            this.pushScene(this.rootScene);
            /**
             * Scene displayed during loading.
             * @type {enchant.Scene}
             */
            this.loadingScene = new enchant.Scene();
            this.loadingScene.backgroundColor = '#000';
            var barWidth = this.width * 0.4 | 0;
            var barHeight = this.width * 0.05 | 0;
            var border = barWidth * 0.03 | 0;
            var bar = new enchant.Sprite(barWidth, barHeight);

            bar.x = (this.width - barWidth) / 2;
            bar.y = (this.height - barHeight) / 2;
            var image = new enchant.Surface(barWidth, barHeight);
            image.context.fillStyle = '#fff';
            image.context.fillRect(0, 0, barWidth, barHeight);
            image.context.fillStyle = '#000';
            image.context.fillRect(border, border, barWidth - border * 2, barHeight - border * 2);
            bar.image = image;
            var progress = 0, _progress = 0;
            this.addEventListener('progress', function(e) {
                progress = e.loaded / e.total;
            });
            bar.addEventListener('enterframe', function() {
                _progress *= 0.9;
                _progress += progress * 0.1;
                image.context.fillStyle = '#fff';
                image.context.fillRect(border, 0, (barWidth - border * 2) * _progress, barHeight);
            });
            this.loadingScene.addChild(bar);

            this._mousedownID = 0;
            this._surfaceID = 0;
            this._soundID = 0;
            this._intervalID = null;

            this._offsetX = 0;
            this._offsetY = 0;

            /**
             * Object that saves input conditions for game.
             * @type {Object.<String, Boolean>}
             */
            this.input = {};
            this._keybind = enchant.ENV.KEY_BIND_TABLE || {};

            var c = 0;
            ['left', 'right', 'up', 'down', 'a', 'b','c','d','e','f','g','h','i','j','k','l','m','n','o','p'].forEach(function(type) {
                this.addEventListener(type + 'buttondown', function(e) {
                    var inputEvent;
                    if (!this.input[type]) {
                        this.input[type] = true;
                        inputEvent = new enchant.Event((c++) ? 'inputchange' : 'inputstart');
                        this.dispatchEvent(inputEvent);
                    }
                    this.currentScene.dispatchEvent(e);
                    if (inputEvent) {
                        this.currentScene.dispatchEvent(inputEvent);
                    }
                });
                this.addEventListener(type + 'buttonup', function(e) {
                    var inputEvent;
                    if (this.input[type]) {
                        this.input[type] = false;
                        inputEvent = new enchant.Event((--c) ? 'inputchange' : 'inputend');
                        this.dispatchEvent(inputEvent);
                    }
                    this.currentScene.dispatchEvent(e);
                    if (inputEvent) {
                        this.currentScene.dispatchEvent(inputEvent);
                    }
                });
            }, this);

            if (initial) {
                stage = enchant.Game.instance._element;
                var evt;
                document.addEventListener('keydown', function(e) {
                    game.dispatchEvent(new enchant.Event('keydown'));
                    if (enchant.ENV.PREVENT_DEFAULT_KEY_CODES.indexOf(e.keyCode) !== -1) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    if (!game.running) {
                        return;
                    }
                    var button = game._keybind[e.keyCode];
                    if (button) {
                        evt = new enchant.Event(button + 'buttondown');
                        game.dispatchEvent(evt);
                    }
                }, true);
                document.addEventListener('keyup', function(e) {
                    if (!game.running) {
                        return;
                    }
                    var button = game._keybind[e.keyCode];
                    if (button) {
                        evt = new enchant.Event(button + 'buttonup');
                        game.dispatchEvent(evt);
                    }
                }, true);

                if (enchant.ENV.TOUCH_ENABLED) {
                    stage.addEventListener('touchstart', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                    stage.addEventListener('touchmove', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                    stage.addEventListener('touchend', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                }
                if (enchant.ENV.MOUSE_ENABLED) {
                    stage.addEventListener('mousedown', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            game._mousedownID++;
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                    stage.addEventListener('mousemove', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                    stage.addEventListener('mouseup', function(e) {
                        var tagName = (e.target.tagName).toLowerCase();
                        if (enchant.ENV.USE_DEFAULT_EVENT_TAGS.indexOf(tagName) === -1) {
                            e.preventDefault();
                            if (!game.running) {
                                e.stopPropagation();
                            }
                        }
                    }, true);
                }
            }
        },
        /**
         * Performs file preload.
         *
         * enchant is a file set to execute preload. It is loaded when
         * Game#start is activated. When all files are loaded, load events are activated
         * from Game objects. When an image file is from Game object assets properties,
         * it will as a Surface object, or a Sound object for sound files,
         * and in other cases it will be accessible as string.
         *
         * In addition, because this Surface object used made with enchant.Surface.load,
         * direct object manipulation is not possible. Refer to the items of enchant.Surface.load
         *
         * @example
         *   game.preload('player.gif');
         *   game.onload = function() {
         *      var sprite = new Sprite(32, 32);
         *      sprite.image = game.assets['player.gif']; // Access via path
         *      ...
         *   };
         *   game.start();
         *
         * @param {...String} assets Preload image path. Multiple settings possible.
         */
        preload: function(assets) {
            if (!(assets instanceof Array)) {
                assets = Array.prototype.slice.call(arguments);
            }
            [].push.apply(this._assets, assets);
        },
        /**
         * File loading.
         *
         * @param {String} asset Load file path.
         * @param {Function} [callback] Function called up when file loading is finished.
         */
        load: function(src, callback) {
            if (callback == null) {
                callback = function() {
                };
            }

            var ext = enchant.Game.findExt(src);

            if (enchant.Game._loadFuncs[ext]) {
                enchant.Game._loadFuncs[ext].call(this, src, callback, ext);
            }
            else {
                var req = new XMLHttpRequest();
                req.open('GET', src, true);
                req.onreadystatechange = function(e) {
                    if (req.readyState === 4) {
                        if (req.status !== 200 && req.status !== 0) {
                            throw new Error(req.status + ': ' + 'Cannot load an asset: ' + src);
                        }

                        var type = req.getResponseHeader('Content-Type') || '';
                        if (type.match(/^image/)) {
                            game.assets[src] = enchant.Surface.load(src);
                            game.assets[src].addEventListener('load', callback);
                        } else if (type.match(/^audio/)) {
                            game.assets[src] = enchant.Sound.load(src, type);
                            game.assets[src].addEventListener('load', callback);
                        } else {
                            game.assets[src] = req.responseText;
                            callback();
                        }
                    }
                };
                req.send(null);
            }
        },
        /**
         * Begin game.
         *
         * Obeying the frame rate set in enchant.Game#fps, the frame in
         * enchant.Game#currentScene will be updated. When a preloaded image is present,
         * loading will begin and the loading screen will be displayed.
         */
        start: function() {
            if (this._intervalID) {
                window.clearInterval(this._intervalID);
            } else if (this._assets.length) {
                if (enchant.Sound.enabledInMobileSafari && !game._touched &&
                    enchant.ENV.VENDOR_PREFIX === 'webkit' && enchant.ENV.TOUCH_ENABLED) {
                    var scene = new enchant.Scene();
                    scene.backgroundColor = '#000';
                    var size = Math.round(game.width / 10);
                    var sprite = new enchant.Sprite(game.width, size);
                    sprite.y = (game.height - size) / 2;
                    sprite.image = new enchant.Surface(game.width, size);
                    sprite.image.context.fillStyle = '#fff';
                    sprite.image.context.font = (size - 1) + 'px bold Helvetica,Arial,sans-serif';
                    var width = sprite.image.context.measureText('Touch to Start').width;
                    sprite.image.context.fillText('Touch to Start', (game.width - width) / 2, size - 1);
                    scene.addChild(sprite);
                    document.addEventListener('touchstart', function() {
                        game._touched = true;
                        game.removeScene(scene);
                        game.start();
                    }, true);
                    game.pushScene(scene);
                    return;
                }

                var o = {};
                var assets = this._assets.filter(function(asset) {
                    return asset in o ? false : o[asset] = true;
                });
                var loaded = 0,
                    len = assets.length,
                    loadFunc = function() {
                        var e = new enchant.Event('progress');
                        e.loaded = ++loaded;
                        e.total = len;
                        game.dispatchEvent(e);
                        if (loaded === len) {
                            game.removeScene(game.loadingScene);
                            game.dispatchEvent(new enchant.Event('load'));
                        }
                    };

                for (var i = 0; i < len; i++) {
                    this.load(assets[i], loadFunc);
                }
                this.pushScene(this.loadingScene);
            } else {
                this.dispatchEvent(new enchant.Event('load'));
            }
            this.currentTime = Date.now();
            this._intervalID = window.setInterval(function() {
                game._tick();
            }, 1000 / this.fps);
            this.running = true;
        },
        /**
         * Begin game debug mode.
         *
         * Game debug mode can be set to on even if enchant.Game.instance._debug flag is set to true.
         */
        debug: function() {
            this._debug = true;
            this.rootScene.addEventListener("enterframe", function(time) {
                this._actualFps = (1 / time);
            });
            this.start();
        },
        actualFps: {
            get: function() {
                return this._actualFps || this.fps;
            }
        },
        _tick: function() {
            var now = Date.now();
            var e = new enchant.Event('enterframe');
            e.elapsed = now - this.currentTime;
            this.currentTime = now;

            var nodes = this.currentScene.childNodes.slice();
            var push = Array.prototype.push;
            while (nodes.length) {
                var node = nodes.pop();
                node.age++;
                node.dispatchEvent(e);
                if (node.childNodes) {
                    push.apply(nodes, node.childNodes);
                }
            }

            this.currentScene.age++;
            this.currentScene.dispatchEvent(e);
            this.dispatchEvent(e);

            this.dispatchEvent(new enchant.Event('exitframe'));
            this.frame++;
        },
        /**
         * Stops game.
         *
         * The frame will not be updated, and player input will not be accepted.
         * Game can be reopened in enchant.Game#start.
         */
        stop: function() {
            if (this._intervalID) {
                window.clearInterval(this._intervalID);
                this._intervalID = null;
            }
            this.running = false;
        },
        /**
         * Stops game.
         *
         * The frame will not be updated, and player input will not be accepted.
         * Game can be reopened in enchant.Game#start.
         */
        pause: function() {
            if (this._intervalID) {
                window.clearInterval(this._intervalID);
                this._intervalID = null;
            }
        },
        /**
         * Resumes game.
         */
        resume: function() {
            if (this._intervalID) {
                return;
            }
            this.currentTime = Date.now();
            this._intervalID = window.setInterval(function() {
                game._tick();
            }, 1000 / this.fps);
            this.running = true;
        },

        /**
         * Switch to new Scene.
         *
         * Scene is controlled in stack, and the display order also obeys stack order.
         * When enchant.Game#pushScene is executed, Scene can be brought to the top of stack.
         * Frame will be updated to reflect Scene at the top of stack.
         *
         * @param {enchant.Scene} scene Switch to new Scene.
         * @return {enchant.Scene} New Scene.
         */
        pushScene: function(scene) {
            this._element.appendChild(scene._element);
            if (this.currentScene) {
                this.currentScene.dispatchEvent(new enchant.Event('exit'));
            }
            this.currentScene = scene;
            this.currentScene.dispatchEvent(new enchant.Event('enter'));
            return this._scenes.push(scene);
        },
        /**
         * End current Scene, return to previous Scene.
         *
         * Scene is controlled in stack, with display order obeying stack order.
         * When enchant.Game#popScene is activated, the Scene at the top of the stack can be pulled out.
         *
         * @return {enchant.Scene} Ended Scene.
         */
        popScene: function() {
            if (this.currentScene === this.rootScene) {
                return this.currentScene;
            }
            this._element.removeChild(this.currentScene._element);
            this.currentScene.dispatchEvent(new enchant.Event('exit'));
            this.currentScene = this._scenes[this._scenes.length - 2];
            this.currentScene.dispatchEvent(new enchant.Event('enter'));
            return this._scenes.pop();
        },
        /**
         * Overwrite current Scene with separate Scene.
         *
         * enchant.Game#popScene, enchant.Game#pushScene are enacted simultaneously.
         *
         * @param {enchant.Scene} scene Replace Scene.
         * @return {enchant.Scene} New Scene.
         */
        replaceScene: function(scene) {
            this.popScene();
            return this.pushScene(scene);
        },
        /**
         * Delete Scene.
         *
         * Deletes Scene from Scene stack.
         *
         * @param {enchant.Scene} scene Delete Scene.
         * @return {enchant.Scene} Deleted Scene.
         */
        removeScene: function(scene) {
            if (this.currentScene === scene) {
                return this.popScene();
            } else {
                var i = this._scenes.indexOf(scene);
                if (i !== -1) {
                    this._scenes.splice(i, 1);
                    this._element.removeChild(scene._element);
                    return scene;
                } else {
                    return null;
                }
            }
        },
        /**
         * Set key binding.
         *
         * Assigns key input to left, right, up, down, a, b button input.
         *
         * @param {Number} key Key code that sets key bind.
         * @param {String} button Assign button.
         */
        keybind: function(key, button) {
            this._keybind[key] = button;
        },
        /**
         * get elapsed time from game.start is called
         * @return {Number} elapsed time (seconds)
         */
        getElapsedTime: function() {
            return this.frame / this.fps;
        }
    });

    enchant.Game._loadFuncs = {};
    enchant.Game._loadFuncs['jpg'] =
        enchant.Game._loadFuncs['jpeg'] =
            enchant.Game._loadFuncs['gif'] =
                enchant.Game._loadFuncs['png'] =
                    enchant.Game._loadFuncs['bmp'] = function(src, callback) {
                        this.assets[src] = enchant.Surface.load(src);
                        this.assets[src].addEventListener('load', callback);
                    };
    enchant.Game._loadFuncs['mp3'] =
        enchant.Game._loadFuncs['aac'] =
            enchant.Game._loadFuncs['m4a'] =
                enchant.Game._loadFuncs['wav'] =
                    enchant.Game._loadFuncs['ogg'] = function(src, callback, ext) {
                        this.assets[src] = enchant.Sound.load(src, 'audio/' + ext);
                        this.assets[src].addEventListener('load', callback);
                    };


    /**
     * find extension from path
     * @param path
     * @return {*}
     */
    enchant.Game.findExt = function(path) {
        var matched = path.match(/\.\w+$/);
        if (matched && matched.length > 0) {
            return matched[0].slice(1).toLowerCase();
        }

        // for data URI
        if (path.indexOf('data:') === 0) {
            return path.split(/[\/;]/)[1].toLowerCase();
        }
        return null;
    };

    /**
     * Current Game instance.
     * @type {enchant.Game}
     * @static
     */
    enchant.Game.instance = null;
}());

/**
 * @scope enchant.Node.prototype
 */
enchant.Node = enchant.Class.create(enchant.EventTarget, {
    /**
     * Base class for objects in displayed object tree routed to Scene.
     * Not directly used.
     * @constructs
     * @extends enchant.EventTarget
     */
    initialize: function() {
        enchant.EventTarget.call(this);

        this._x = 0;
        this._y = 0;
        this._offsetX = 0;
        this._offsetY = 0;

        /**
         *         *         * age (frames) of this node which will be increased before this node receives ENTER_FRAME event.
         *         * @type {Number}
         */
        this.age = 0;

        /**
         * Parent Node for Node.
         * @type {enchant.Group}
         */
        this.parentNode = null;
        /**
         * Scene to which Node belongs.
         * @type {enchant.Scene}
         */
        this.scene = null;

        this.addEventListener('touchstart', function(e) {
            if (this.parentNode && !this.parentNode._element) {
                this.parentNode.dispatchEvent(e);
            }
        });
        this.addEventListener('touchmove', function(e) {
            if (this.parentNode && !this.parentNode._element) {
                this.parentNode.dispatchEvent(e);
            }
        });
        this.addEventListener('touchend', function(e) {
            if (this.parentNode && !this.parentNode._element) {
                this.parentNode.dispatchEvent(e);
            }
        });
    },
    /**
     * Move Node.
     * @param {Number} x Target x coordinates.
     * @param {Number} y Target y coordinates.
     */
    moveTo: function(x, y) {
        this._x = x;
        this._y = y;
        this._updateCoordinate();
    },
    /**
     * Move Node.
     * @param {Number} x x axis movement distance.
     * @param {Number} y y axis movement distance.
     */
    moveBy: function(x, y) {
        this._x += x;
        this._y += y;
        this._updateCoordinate();
    },
    /**
     * x coordinates of Node.
     * @type {Number}
     */
    x: {
        get: function() {
            return this._x;
        },
        set: function(x) {
            this._x = x;
            this._updateCoordinate();
        }
    },
    /**
     * y coordinates of Node.
     * @type {Number}
     */
    y: {
        get: function() {
            return this._y;
        },
        set: function(y) {
            this._y = y;
            this._updateCoordinate();
        }
    },
    _updateCoordinate: function() {
        if (this.parentNode) {
            this._offsetX = this.parentNode._offsetX + this._x;
            this._offsetY = this.parentNode._offsetY + this._y;
        } else {
            this._offsetX = this._x;
            this._offsetY = this._y;
        }
    },
    remove: function() {
        if (this._listener) {
            this.clearEventListener();
        }
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }
});
/**
 * @scope enchant.Entity.prototype
 */
enchant.Entity = enchant.Class.create(enchant.Node, {
    /**
     * A class with objects displayed on DOM. Not used directly.
     * @constructs
     * @extends enchant.Node
     */
    initialize: function() {
        var game = enchant.Game.instance;
        enchant.Node.call(this);

        this._element = document.createElement('div');
        this._style = this._element.style;
        this._style.position = 'absolute';

        this._width = 0;
        this._height = 0;
        this._backgroundColor = null;
        this._opacity = 1;
        this._visible = true;
        this._buttonMode = null;

        if (enchant.Game.instance._debug) {
            this._style.border = "1px solid blue";
            this._style.margin = "-1px";
        }

        /**
         * Set button function to Entity.
         * Apply touch, click to left, right, up, down, a, b
         * for button input for Entity.
         * @type {String}
         */
        this.buttonMode = null;
        /**
         * Checks if Entity is being pushed.
         * Only functions when buttonMode is set.
         * @type {Boolean}
         */
        this.buttonPressed = false;
        this.addEventListener('touchstart', function() {
            if (!this.buttonMode) {
                return;
            }
            this.buttonPressed = true;
            var e = new enchant.Event(this.buttonMode + 'buttondown');
            this.dispatchEvent(e);
            game.dispatchEvent(e);
        });
        this.addEventListener('touchend', function() {
            if (!this.buttonMode) {
                return;
            }
            this.buttonPressed = false;
            var e = new enchant.Event(this.buttonMode + 'buttonup');
            this.dispatchEvent(e);
            game.dispatchEvent(e);
        });

        var that = this;
        var render = function() {
            that.dispatchEvent(new enchant.Event('render'));
        };
        this.addEventListener('addedtoscene', function() {
            render();
            game.addEventListener('exitframe', render);
        });
        this.addEventListener('removedfromscene', function() {
            game.removeEventListener('exitframe', render);
        });
        this.addEventListener('render', function() {
            if (this._offsetX !== this._previousOffsetX) {
                this._style.left = this._offsetX + 'px';
            }
            if (this._offsetY !== this._previousOffsetY) {
                this._style.top = this._offsetY + 'px';
            }
            this._previousOffsetX = this._offsetX;
            this._previousOffsetY = this._offsetY;
        });

        if (enchant.ENV.TOUCH_ENABLED) {
            this._element.addEventListener('touchstart', function(e) {
                var touches = e.touches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchstart');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);

                    /*
                     * if preventDefault() of touch event called,
                     * mouse*** event won't be dispatched for the element. (see issue #129)
                     */
                    e.preventDefault();

                    that.dispatchEvent(e);
                }
            }, false);
            this._element.addEventListener('touchmove', function(e) {
                var touches = e.touches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchmove');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);
                    e.preventDefault();
                    that.dispatchEvent(e);
                }
            }, false);
            this._element.addEventListener('touchend', function(e) {
                var touches = e.changedTouches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchend');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);
                    e.preventDefault();
                    that.dispatchEvent(e);
                }
            }, false);
        }
        if (enchant.ENV.MOUSE_ENABLED){
            this._element.addEventListener('mousedown', function(e) {
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchstart');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                that.dispatchEvent(e);
                that._mousedown = true;
            }, false);
            game._element.addEventListener('mousemove', function(e) {
                if (!that._mousedown) {
                    return;
                }
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchmove');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                that.dispatchEvent(e);
            }, false);
            game._element.addEventListener('mouseup', function(e) {
                if (!that._mousedown) {
                    return;
                }
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchend');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                that.dispatchEvent(e);
                that._mousedown = false;
            }, false);
        }
    },
    /**
     * DOM ID.
     * @type {String}
     */
    id: {
        get: function() {
            return this._element.id;
        },
        set: function(id) {
            this._element.id = id;
        }
    },
    /**
     * DOM class.
     * @type {String}
     */
    className: {
        get: function() {
            return this._element.className;
        },
        set: function(className) {
            this._element.className = className;
        }
    },
    /**
     * Entity width.
     * @type {Number}
     */
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._style.width = (this._width = width) + 'px';
        }
    },
    /**
     * Entity height.
     * @type {Number}
     */
    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._style.height = (this._height = height) + 'px';
        }
    },
    /**
     * Entity background color.
     * Designates as same format as CSS 'color' properties.
     * @type {String}
     */
    backgroundColor: {
        get: function() {
            return this._backgroundColor;
        },
        set: function(color) {
            this._element.style.backgroundColor = this._backgroundColor = color;
        }
    },
    /**
     * Entity transparency.
     * Sets level from 0 to 1 (0 is completely transparent, 1 is completely opaque).
     * @type {Number}
     */
    opacity: {
        get: function() {
            return this._opacity;
        },
        set: function(opacity) {
            this._style.opacity = this._opacity = opacity;
        }
    },
    /**
     * Indicates whether or not to display Entity.
     * @type {Boolean}
     */
    visible: {
        get: function() {
            return this._visible;
        },
        set: function(visible) {
            if (this._visible = visible) {
                this._style.display = 'block';
            } else {
                this._style.display = 'none';
            }
        }
    },
    /**
     * Designates whether or not to make Entity touch valid.
     * @type {Boolean}
     */
    touchEnabled: {
        get: function() {
            return this._touchEnabled;
        },
        set: function(enabled) {
            if (this._touchEnabled = enabled) {
                this._style.pointerEvents = 'all';
            } else {
                this._style.pointerEvents = 'none';
            }
        }
    },
    /**
     * Operates collision detection based on whether or not rectangle angles are intersecting.
     * @param {*} other Object with properties of x, y, width, height that operate Entity collision detection.
     * @return {Boolean} Collision detection results.
     */
    intersect: function(other) {
        return this._offsetX < other._offsetX + other.width && other._offsetX < this._offsetX + this.width &&
            this._offsetY < other._offsetY + other.height && other._offsetY < this._offsetY + this.height;
    },
    /**
     * Operates collision detection based on distance from Entity's central point.
     * @param {*} other Object with properties of x, y, width, height that operate Entity collision detection.
     * @param {Number} [distance] Greatest distance considered in collision. Default level is average of Entity width and height.
     * @return {Boolean} Collision detection result.
     */
    within: function(other, distance) {
        if (distance == null) {
            distance = (this.width + this.height + other.width + other.height) / 4;
        }
        var _;
        return (_ = this._offsetX - other._offsetX + (this.width - other.width) / 2) * _ +
            (_ = this._offsetY - other._offsetY + (this.height - other.height) / 2) * _ < distance * distance;
    }, /**
     * Expand or contract Sprite.
     * @param {Number} x Scaling for x axis to be expanded.
     * @param {Number} [y] Scaling for y axis to be expanded.
     */
    scale: function(x, y) {
        this._scaleX *= x;
        this._scaleY *= (y != null) ? y : x;
        this._dirty = true;
    },
    /**
     * Rotate Sprite.
     * @param {Number} deg Rotation angle (frequency).
     */
    rotate: function(deg) {
        this._rotation += deg;
        this._dirty = true;
    },
    /**
     * Scaling for Sprite's x axis direction.
     * @type {Number}
     */
    scaleX: {
        get: function() {
            return this._scaleX;
        },
        set: function(scaleX) {
            this._scaleX = scaleX;
            this._dirty = true;
        }
    },
    /**
     * Scaling for Sprite's y axis direction.
     * @type {Number}
     */
    scaleY: {
        get: function() {
            return this._scaleY;
        },
        set: function(scaleY) {
            this._scaleY = scaleY;
            this._dirty = true;
        }
    },
    /**
     * Sprite rotation angle (frequency).
     * @type {Number}
     */
    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            this._rotation = rotation;
            this._dirty = true;
        }
    },
    /**
     * origin point of rotation, scaling
     * @type {Number}
     */
    originX: {
        get: function() {
            return this._originX;
        },
        set: function(originX) {
            this._originX = originX;
        }
    },
    /**
     * origin point of rotation, scaling
     * @type {Number}
     */
    originY: {
        get: function() {
            return this._originY;
        },
        set: function(originY) {
            this._originY = originY;
        }
    }
});
/**
 * @scope enchant.Sprite.prototype
 */
enchant.Sprite = enchant.Class.create(enchant.Entity, {
    /**
     * Class for image display function.
     *
     * @example
     *   var bear = new Sprite(32, 32);
     *   bear.image = game.assets['chara1.gif'];
     *
     * @param {Number} [width] Sprite width.g
     * @param {Number} [height] Sprite height.
     * @constructs
     * @extends enchant.Entity
     */
    initialize: function(width, height) {
        enchant.Entity.call(this);

        this.width = width;
        this.height = height;
        this._scaleX = 1;
        this._scaleY = 1;
        this._rotation = 0;
        this._dirty = false;
        this._image = null;
        this._frame = 0;
        this._frameSequence = [];

        this._style.overflow = 'hidden';

        this.addEventListener('render', function() {
            if (this._dirty) {
                var transform = [
                    'rotate(', this._rotation, 'deg)',
                    'scale(', this._scaleX, ',', this._scaleY, ')'
                ];
                // Issues #80
                if (navigator.userAgent.indexOf('iPhone') !== -1) {
                  transform.push('translate3d(0,0,0)');
                }
                this._style[enchant.ENV.VENDOR_PREFIX + 'Transform'] = transform.join('');
                this._dirty = false;
            }
        });

        /**
         * frame に配列が指定されたときの処理。
         * _frameSeuence に
         */
        this.addEventListener('enterframe', function() {
            if (this._frameSequence.length !== 0) {
                var nextFrame = this._frameSequence.shift();
                if (nextFrame === null) {
                    this._frameSequence = [];
                } else {
                    this._setFrame(nextFrame);
                    this._frameSequence.push(nextFrame);
                }
            }
        });

        if (enchant.Game.instance._debug) {
            this._style.border = "1px solid red";
            this._style.margin = "-1px";
        }
    },
    /**
     * Image displayed in Sprite.
     * @type {enchant.Surface}
     */
    image: {
        get: function() {
            return this._image;
        },
        set: function(image) {
            if (image === this._image){
                return;
            }

            if (this._image != null) {
                if (this._image.css) {
                    this._style.backgroundImage = '';
                } else if (this._element.firstChild) {
                    this._element.removeChild(this._element.firstChild);
                    if (this._dirtyListener) {
                        this.removeEventListener('render', this._dirtyListener);
                        this._dirtyListener = null;
                    } else {
                        this._image._parent = null;
                    }
                }
            }

            if (image != null) {
                if (image._css) {
                    this._style.backgroundImage = image._css;
                } else if (image._parent) {
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image._element, 0, 0);
                    this._dirtyListener = function() {
                        if (image._dirty) {
                            context.drawImage(image._element);
                            image._dirty = false;
                        }
                    };
                    this.addEventListener('render', this._dirtyListener);
                    this._element.appendChild(canvas);
                } else {
                    image._parent = this;
                    this._element.appendChild(image._element);
                }
            }
            this._image = image;
            this.frame = this.frame;
        }
    },
    /**
     * Frame index display.
     * Frames with same width and height as Sprite will be arrayed in order from upper left of image properties image.
     * By setting the index to start with 0, frames are switched.
     * @type {Number|Array}
     */
    frame: {
        get: function() {
            return this._frame;
        },
        set: function(frame) {
            if (frame instanceof Array) {
                var frameSequence = frame;
                var nextFrame = frameSequence.shift();
                this._setFrame(nextFrame);
                frameSequence.push(nextFrame);
                this._frameSequence = frameSequence;
            } else {
                this._setFrame(frame);
                this._frameSequence = [];
                this._frame = frame;
            }
        }
    },
    /**
     * @param frame
     * @private
     */
    _setFrame: function(frame) {
        if (this._image != null) {
            this._frame = frame;
            var row = this._image.width / this._width | 0;
            if (this._image._css) {
                this._style.backgroundPosition = [
                    -(frame % row | 0) * this._width, 'px ',
                    -(frame / row | 0) * this._height, 'px'
                ].join('');
            } else if (this._element.firstChild) {
                var style = this._element.firstChild.style;
                style.left = -(frame % row | 0) * this._width + 'px';
                style.top = -(frame / row | 0) * this._height + 'px';
            }
        }
    }
});
/**
 * @scope enchant.Label.prototype
 */
enchant.Label = enchant.Class.create(enchant.Entity, {
    /**
     * Create Label object.
     * @constructs
     * @extends enchant.Entity
     */
    initialize: function(text) {
        enchant.Entity.call(this);

        this.width = 300;
        this.text = text;
        this.textAlign = 'left';
    },
    /**
     * Text to display.
     * @type {String}
     */
    text: {
        get: function() {
            return this._element.innerHTML;
        },
        set: function(text) {
            this._element.innerHTML = text;
        }
    },
    /**
     * Specifies horizontal alignment of text.
     * Can be set to same format as CSS 'text-align' property.
     * @type {String}
     */
    textAlign: {
        get: function() {
            return this._style.textAlign;
        },
        set: function(textAlign) {
            this._style.textAlign = textAlign;
        }
    },
    /**
     * Font settings.
     * CSSの'font' Can be set to same format as properties.
     * @type {String}
     */
    font: {
        get: function() {
            return this._style.font;
        },
        set: function(font) {
            this._style.font = font;
        }
    },
    /**
     * Text color settings.
     * CSSの'color' Can be set to same format as properties.
     * @type {String}
     */
    color: {
        get: function() {
            return this._style.color;
        },
        set: function(color) {
            this._style.color = color;
        }
    }
});

(function() {
    /**
     * @scope enchant.Map.prototype
     */
    enchant.Map = enchant.Class.create(enchant.Entity, {
        /**
         * A class to create and display maps from a tile set.
         *
         * @param {Number} tileWidth Tile width.
         * @param {Number} tileHeight Tile height.
         * @constructs
         * @extends enchant.Entity
         */
        initialize: function(tileWidth, tileHeight) {
            var game = enchant.Game.instance;

            enchant.Entity.call(this);

            var canvas = document.createElement('canvas');
            if (enchant.ENV.RETINA_DISPLAY && game.scale === 2) {
                canvas.width = game.width * 2;
                canvas.height = game.height * 2;
                this._style.webkitTransformOrigin = '0 0';
                this._style.webkitTransform = 'scale(0.5)';
            } else {
                canvas.width = game.width;
                canvas.height = game.height;
            }
            this._element.appendChild(canvas);
            this._context = canvas.getContext('2d');

            this._tileWidth = tileWidth || 0;
            this._tileHeight = tileHeight || 0;
            this._image = null;
            this._data = [
                [
                    []
                ]
            ];
            this._dirty = false;
            this._tight = false;

            this.touchEnabled = false;

            /**
             * Two dimensional array to show level of tiles with collision detection.
             * @type {Array.<Array.<Number>>}
             */
            this.collisionData = null;

            this._listeners['render'] = null;
            this.addEventListener('render', function() {
                if (this._dirty || this._previousOffsetX == null) {
                    this._dirty = false;
                    this.redraw(0, 0, game.width, game.height);
                } else if (this._offsetX !== this._previousOffsetX ||
                    this._offsetY !== this._previousOffsetY) {
                    if (this._tight) {
                        var x = -this._offsetX;
                        var y = -this._offsetY;
                        var px = -this._previousOffsetX;
                        var py = -this._previousOffsetY;
                        var w1 = x - px + game.width;
                        var w2 = px - x + game.width;
                        var h1 = y - py + game.height;
                        var h2 = py - y + game.height;
                        if (w1 > this._tileWidth && w2 > this._tileWidth &&
                            h1 > this._tileHeight && h2 > this._tileHeight) {
                            var sx, sy, dx, dy, sw, sh;
                            if (w1 < w2) {
                                sx = 0;
                                dx = px - x;
                                sw = w1;
                            } else {
                                sx = x - px;
                                dx = 0;
                                sw = w2;
                            }
                            if (h1 < h2) {
                                sy = 0;
                                dy = py - y;
                                sh = h1;
                            } else {
                                sy = y - py;
                                dy = 0;
                                sh = h2;
                            }

                            if (game._buffer == null) {
                                game._buffer = document.createElement('canvas');
                                game._buffer.width = this._context.canvas.width;
                                game._buffer.height = this._context.canvas.height;
                            }
                            var context = game._buffer.getContext('2d');
                            if (this._doubledImage) {
                                context.clearRect(0, 0, sw * 2, sh * 2);
                                context.drawImage(this._context.canvas,
                                    sx * 2, sy * 2, sw * 2, sh * 2, 0, 0, sw * 2, sh * 2);
                                context = this._context;
                                context.clearRect(dx * 2, dy * 2, sw * 2, sh * 2);
                                context.drawImage(game._buffer,
                                    0, 0, sw * 2, sh * 2, dx * 2, dy * 2, sw * 2, sh * 2);
                            } else {
                                context.clearRect(0, 0, sw, sh);
                                context.drawImage(this._context.canvas,
                                    sx, sy, sw, sh, 0, 0, sw, sh);
                                context = this._context;
                                context.clearRect(dx, dy, sw, sh);
                                context.drawImage(game._buffer,
                                    0, 0, sw, sh, dx, dy, sw, sh);
                            }

                            if (dx === 0) {
                                this.redraw(sw, 0, game.width - sw, game.height);
                            } else {
                                this.redraw(0, 0, game.width - sw, game.height);
                            }
                            if (dy === 0) {
                                this.redraw(0, sh, game.width, game.height - sh);
                            } else {
                                this.redraw(0, 0, game.width, game.height - sh);
                            }
                        } else {
                            this.redraw(0, 0, game.width, game.height);
                        }
                    } else {
                        this.redraw(0, 0, game.width, game.height);
                    }
                }
                this._previousOffsetX = this._offsetX;
                this._previousOffsetY = this._offsetY;
            });
        },
        /**
         * Set data.
         * Sees that tiles are set in order in array from the upper left of image properties image,
         * and sets a two-dimensional index array starting from 0. When more than one is set, they are displayed in reverse order.
         * @param {...Array<Array.<Number>>} data Two-dimensional display of tile index. Multiple designations possible.
         */
        loadData: function(data) {
            this._data = Array.prototype.slice.apply(arguments);
            this._dirty = true;

            this._tight = false;
            for (var i = 0, len = this._data.length; i < len; i++) {
                var c = 0;
                data = this._data[i];
                for (var y = 0, l = data.length; y < l; y++) {
                    for (var x = 0, ll = data[y].length; x < ll; x++) {
                        if (data[y][x] >= 0){
                            c++;
                        }
                    }
                }
                if (c / (data.length * data[0].length) > 0.2) {
                    this._tight = true;
                    break;
                }
            }
        },
        /**
         * Check what tile it is on designated position
         */
        checkTile: function(x, y) {
            if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
                return false;
            }
            var width = this._image.width;
            var height = this._image.height;
            var tileWidth = this._tileWidth || width;
            var tileHeight = this._tileHeight || height;
            x = x / tileWidth | 0;
            y = y / tileHeight | 0;
            //		return this._data[y][x];
            var data = this._data[0];
            return data[y][x];
        },
        /**
         * Judges whether or not obstacles are on top of Map.
         * @param {Number} x x coordinates of detection spot on map.
         * @param {Number} y y coordinates of detection spot on map.
         * @return {Boolean} Checks for obstacles.
         */
        hitTest: function(x, y) {
            if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
                return false;
            }
            var width = this._image.width;
            var height = this._image.height;
            var tileWidth = this._tileWidth || width;
            var tileHeight = this._tileHeight || height;
            x = x / tileWidth | 0;
            y = y / tileHeight | 0;
            if (this.collisionData != null) {
                return this.collisionData[y] && !!this.collisionData[y][x];
            } else {
                for (var i = 0, len = this._data.length; i < len; i++) {
                    var data = this._data[i];
                    var n;
                    if (data[y] != null && (n = data[y][x]) != null &&
                        0 <= n && n < (width / tileWidth | 0) * (height / tileHeight | 0)) {
                        return true;
                    }
                }
                return false;
            }
        },
        /**
         * Tile set image displayed on Map.
         * @type {enchant.Surface}
         */
        image: {
            get: function() {
                return this._image;
            },
            set: function(image) {
                var game = enchant.Game.instance;

                this._image = image;
                if (enchant.ENV.RETINA_DISPLAY && game.scale === 2) {
                    var img = new enchant.Surface(image.width * 2, image.height * 2);
                    var tileWidth = this._tileWidth || image.width;
                    var tileHeight = this._tileHeight || image.height;
                    var row = image.width / tileWidth | 0;
                    var col = image.height / tileHeight | 0;
                    for (var y = 0; y < col; y++) {
                        for (var x = 0; x < row; x++) {
                            img.draw(image, x * tileWidth, y * tileHeight, tileWidth, tileHeight,
                                x * tileWidth * 2, y * tileHeight * 2, tileWidth * 2, tileHeight * 2);
                        }
                    }
                    this._doubledImage = img;
                }
                this._dirty = true;
            }
        },
        /**
         * Map tile width.
         * @type {Number}
         */
        tileWidth: {
            get: function() {
                return this._tileWidth;
            },
            set: function(tileWidth) {
                this._tileWidth = tileWidth;
                this._dirty = true;
            }
        },
        /**
         * Map tile height.
         * @type {Number}
         */
        tileHeight: {
            get: function() {
                return this._tileHeight;
            },
            set: function(tileHeight) {
                this._tileHeight = tileHeight;
                this._dirty = true;
            }
        },
        /**
         * @private
         */
        width: {
            get: function() {
                return this._tileWidth * this._data[0][0].length;
            }
        },
        /**
         * @private
         */
        height: {
            get: function() {
                return this._tileHeight * this._data[0].length;
            }
        },
        /**
         * @private
         */
        redraw: function(x, y, width, height) {
            if (this._image == null) {
                return;
            }

            var image, tileWidth, tileHeight, dx, dy;
            if (this._doubledImage) {
                image = this._doubledImage;
                tileWidth = this._tileWidth * 2;
                tileHeight = this._tileHeight * 2;
                dx = -this._offsetX * 2;
                dy = -this._offsetY * 2;
                x *= 2;
                y *= 2;
                width *= 2;
                height *= 2;
            } else {
                image = this._image;
                tileWidth = this._tileWidth;
                tileHeight = this._tileHeight;
                dx = -this._offsetX;
                dy = -this._offsetY;
            }
            var row = image.width / tileWidth | 0;
            var col = image.height / tileHeight | 0;
            var left = Math.max((x + dx) / tileWidth | 0, 0);
            var top = Math.max((y + dy) / tileHeight | 0, 0);
            var right = Math.ceil((x + dx + width) / tileWidth);
            var bottom = Math.ceil((y + dy + height) / tileHeight);

            var source = image._element;
            var context = this._context;
            var canvas = context.canvas;
            context.clearRect(x, y, width, height);
            for (var i = 0, len = this._data.length; i < len; i++) {
                var data = this._data[i];
                var r = Math.min(right, data[0].length);
                var b = Math.min(bottom, data.length);
                for (y = top; y < b; y++) {
                    for (x = left; x < r; x++) {
                        var n = data[y][x];
                        if (0 <= n && n < row * col) {
                            var sx = (n % row) * tileWidth;
                            var sy = (n / row | 0) * tileHeight;
                            context.drawImage(source, sx, sy, tileWidth, tileHeight,
                                x * tileWidth - dx, y * tileHeight - dy, tileWidth, tileHeight);
                        }
                    }
                }
            }
        }
    });
}());


/**
 * @scope enchant.Group.prototype
 */
enchant.Group = enchant.Class.create(enchant.Node, {
    /**
     * A class that can hold multiple Nodes.
     *
     * @example
     *   var stage = new Group();
     *   stage.addChild(player);
     *   stage.addChild(enemy);
     *   stage.addChild(map);
     *   stage.addEventListener('enterframe', function() {
     *      // Scrolls entire frame in response to player's coordinates.
     *      if (this.x > 64 - player.x) {
     *          this.x = 64 - player.x;
     *      }
     *   });
     *
     * @constructs
     * @extends enchant.Node
     */
    initialize: function() {
        enchant.Node.call(this);

        /**
         * Child Node.
         * @type {Array.<enchant.Node>}
         */
        this.childNodes = [];

        this._x = 0;
        this._y = 0;

        [enchant.Event.ADDED_TO_SCENE, enchant.Event.REMOVED_FROM_SCENE]
            .forEach(function(event) {
                this.addEventListener(event, function(e) {
                    this.childNodes.forEach(function(child) {
                        child.scene = this.scene;
                        child.dispatchEvent(e);
                    }, this);
                });
            }, this);
    },
    /**
     * Adds Node to Group.
     * @param {enchant.Node} node Added Node.
     */
    addChild: function(node) {
        this.childNodes.push(node);
        node.parentNode = this;
        node.dispatchEvent(new enchant.Event('added'));
        if (this.scene) {
            var e = new enchant.Event('addedtoscene');
            node.scene = this.scene;
            node.dispatchEvent(e);
            node._updateCoordinate();

            var fragment = document.createDocumentFragment();
            var nodes;
            var push = Array.prototype.push;
            if (node._element) {
                fragment.appendChild(node._element);
            } else if (node.childNodes) {
                nodes = node.childNodes.slice().reverse();
                while (nodes.length) {
                    node = nodes.pop();
                    node.scene = this.scene;
                    node.dispatchEvent(e);
                    if (node._element) {
                        fragment.appendChild(node._element);
                    } else if (node.childNodes) {
                        push.apply(nodes, node.childNodes.reverse());
                    }
                }
            }
            if (!fragment.childNodes.length){
                return;
            }

            var nextSibling, thisNode = this;
            while (thisNode.parentNode) {
                nodes = thisNode.parentNode.childNodes;
                nodes = nodes.slice(nodes.indexOf(thisNode) + 1).reverse();
                while (nodes.length) {
                    node = nodes.pop();
                    if (node._element) {
                        nextSibling = node._element;
                        break;
                    } else if (node.childNodes) {
                        push.apply(nodes, node.childNodes.slice().reverse());
                    }
                }
                thisNode = thisNode.parentNode;
            }
            if (nextSibling) {
                this.scene._element.insertBefore(fragment, nextSibling);
            } else {
                this.scene._element.appendChild(fragment);
            }
        }
    },
    /**
     * Incorporates Node into Group.
     * @param {enchant.Node} node Incorporated Node.
     * @param {enchant.Node} reference Node in position before incorporation.
     */
    insertBefore: function(node, reference) {
        var i = this.childNodes.indexOf(reference);
        if (i !== -1) {
            this.childNodes.splice(i, 0, node);
            node.parentNode = this;
            node.dispatchEvent(new enchant.Event('added'));
            if (this.scene) {
                var e = new enchant.Event('addedtoscene');
                node.scene = this.scene;
                node.dispatchEvent(e);
                node._updateCoordinate();

                var fragment = document.createDocumentFragment();
                var nodes;
                var push = Array.prototype.push;
                if (node._element) {
                    fragment.appendChild(node._element);
                } else if (node.childNodes) {
                    nodes = node.childNodes.slice().reverse();
                    while (nodes.length) {
                        node = nodes.pop();
                        node.scene = this.scene;
                        node.dispatchEvent(e);
                        if (node._element) {
                            fragment.appendChild(node._element);
                        } else if (node.childNodes) {
                            push.apply(nodes, node.childNodes.reverse());
                        }
                    }
                }
                if (!fragment.childNodes.length){
                    return;
                }

                var nextSibling, thisNode = reference;
                while (thisNode !== this) {
                    if (i != null) {
                        nodes = this.childNodes.slice(i + 1).reverse();
                        i = null;
                    } else {
                        nodes = thisNode.parentNode.childNodes;
                        nodes = nodes.slice(nodes.indexOf(thisNode) + 1).reverse();
                    }
                    while (nodes.length) {
                        node = nodes.pop();
                        if (node._element) {
                            nextSibling = node._element;
                            break;
                        } else if (node.childNodes) {
                            push.apply(nodes, node.childNodes.slice().reverse());
                        }
                    }
                    thisNode = thisNode.parentNode;
                }
                if (nextSibling) {
                    this.scene._element.insertBefore(fragment, nextSibling);
                } else {
                    this.scene._element.appendChild(fragment);
                }
            }
        } else {
            this.addChild(node);
        }
    },
    /**
     * Delete Node from Group.
     * @param {enchant.Node} node Deleted Node.
     */
    removeChild: function(node) {
        var i = this.childNodes.indexOf(node);
        if (i !== -1) {
            this.childNodes.splice(i, 1);
        } else {
            return;
        }
        node.parentNode = null;
        node.dispatchEvent(new enchant.Event('removed'));
        if (this.scene) {
            var e = new enchant.Event('removedfromscene');
            node.scene = null;
            node.dispatchEvent(e);
            if (node._element) {
                this.scene._element.removeChild(node._element);
            } else if (node.childNodes) {
                var nodes = node.childNodes.slice();
                var push = Array.prototype.push;
                while (nodes.length) {
                    node = nodes.pop();
                    node.scene = null;
                    node.dispatchEvent(e);
                    if (node._element) {
                        this.scene._element.removeChild(node._element);
                    } else if (node.childNodes) {
                        push.apply(nodes, node.childNodes);
                    }
                }
            }
        }
    },
    /**
     * First child Node.
     * @type {enchant.Node}
     */
    firstChild: {
        get: function() {
            return this.childNodes[0];
        }
    },
    /**
     * Last child Node.
     * @type {enchant.Node}
     */
    lastChild: {
        get: function() {
            return this.childNodes[this.childNodes.length - 1];
        }
    },
    _updateCoordinate: function() {
        if (this.parentNode) {
            this._offsetX = this.parentNode._offsetX + this._x;
            this._offsetY = this.parentNode._offsetY + this._y;
        } else {
            this._offsetX = this._x;
            this._offsetY = this._y;
        }
        for (var i = 0, len = this.childNodes.length; i < len; i++) {
            this.childNodes[i]._updateCoordinate();
        }
    },
    /**
     * rotation of group
     * @type {Number}
     */
    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            var diff_rotation = (rotation - this._rotation);

            if (diff_rotation === 0){
                return;
            }
            var rad = diff_rotation / 180 * Math.PI;
            var sin = Math.sin(rad);
            var cos = Math.cos(rad);

            for (var i = 0, len = this.childNodes.length; i < len; i++) {
                var node = this.childNodes[i];
                var rx = (node.x - node.originX | 0);
                var ry = (node.y - node.originY | 0);
                node.x += +cos * rx + sin * ry + node.originX | 0;
                node.y += -sin * rx + cos * ry + node.originY | 0;
            }

            this._rotation = rotation;
        }
    },
    /**
     * origin point of rotation, scaling
     * @type {Number}
     */
    originX: {
        get: function() {
            return this._originX;
        },
        set: function(originX) {
            this._originX = originX;
        }
    },
    /**
     * origin point of rotation, scaling
     * @type {Number}
     */
    originY: {
        get: function() {
            return this._originY;
        },
        set: function(originY) {
            this._originY = originY;
        }
    }
});

(function() {
    /**
     * @scope enchant.CanvasGroup.prototype
     */
    enchant.CanvasGroup = enchant.Class.create(enchant.Group, {
        /**
         * @constructs
         */
        initialize: function() {
            var game = enchant.Game.instance;
            var that = this;
            enchant.Group.call(this);
            this._dirty = false;
            this._rotation = 0;

            this._cvsCache = {
                matrix: [1, 0, 0, 1, 0, 0],
                detectColor: '#0000000'
            };

            this.width = game.width;
            this.height = game.height;

            this._element = document.createElement('canvas');
            this._element.width = game.width;
            this._element.height = game.height;
            this._element.style.position = 'absolute';

            this._detect = document.createElement('canvas');
            this._detect.width = game.width;
            this._detect.height = game.height;
            this._detect.style.position = 'absolute';

            this.context = this._element.getContext('2d');
            this._dctx = this._detect.getContext('2d');

            this._colorManager = new DetectColorManager(16, 256);

            if (enchant.ENV.TOUCH_ENABLED) {
                this._element.addEventListener('touchstart', function(e) {
                    var touches = e.touches;
                    for (var i = 0, len = touches.length; i < len; i++) {
                        e = new enchant.Event('touchstart');
                        e.identifier = touches[i].identifier;
                        e._initPosition(touches[i].pageX, touches[i].pageY);
                        _touchstartFromDom.call(that, e);
                    }
                }, false);
                this._element.addEventListener('touchmove', function(e) {
                    var touches = e.touches;
                    for (var i = 0, len = touches.length; i < len; i++) {
                        e = new enchant.Event('touchmove');
                        e.identifier = touches[i].identifier;
                        e._initPosition(touches[i].pageX, touches[i].pageY);
                        _touchmoveFromDom.call(that, e);
                    }
                }, false);
                this._element.addEventListener('touchend', function(e) {
                    var touches = e.changedTouches;
                    for (var i = 0, len = touches.length; i < len; i++) {
                        e = new enchant.Event('touchend');
                        e.identifier = touches[i].identifier;
                        e._initPosition(touches[i].pageX, touches[i].pageY);
                        _touchendFromDom.call(that, e);
                    }
                }, false);
            }
            this._element.addEventListener('mousedown', function(e) {
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchstart');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                _touchstartFromDom.call(that, e);
                that._mousedown = true;
            }, false);
            game._element.addEventListener('mousemove', function(e) {
                if (!that._mousedown) {
                    return;
                }
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchmove');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                _touchmoveFromDom.call(that, e);
            }, false);
            game._element.addEventListener('mouseup', function(e) {
                if (!that._mousedown) {
                    return;
                }
                var x = e.pageX;
                var y = e.pageY;
                e = new enchant.Event('touchend');
                e.identifier = game._mousedownID;
                e._initPosition(x, y);
                _touchendFromDom.call(that, e);
                that._mousedown = false;
            }, false);

            var start = [
                enchant.Event.ENTER,
                enchant.Event.ADDED_TO_SCENE
            ];
            var end = [
                enchant.Event.EXIT,
                enchant.Event.REMOVED_FROM_SCENE
            ];
            start.forEach(function(type) {
                this.addEventListener(type, this._startRendering);
                this.addEventListener(type, function() {
                    canvasGroupInstances.push(this);
                });
            }, this);
            end.forEach(function(type) {
                this.addEventListener(type, this._stopRendering);
                this.addEventListener(type, function() {
                    var i = canvasGroupInstances.indexOf(this);
                    if (i !== -1) {
                        canvasGroupInstances.splice(i, 1);
                    }
                });
            }, this);

            this._onexitframe = function() {
                var ctx = that.context;
                ctx.clearRect(0, 0, game.width, game.height);
                checkCache.call(that, that._colorManager);
                rendering.call(that, ctx);
            };
        },
        _startRendering: function() {
            var game = enchant.Game.instance;
            if (!game._listeners['exitframe']) {
                game._listeners['exitframe'] = [];
            }
            game._listeners['exitframe'].push(this._onexitframe);
        },
        _stopRendering: function() {
            var game = enchant.Game.instance;
            game.removeEventListener('exitframe', this._onexitframe);
        },
        _getEntityByPosition: function(x, y) {
            var ctx = this._dctx;
            ctx.clearRect(0, 0, this.width, this.height);
            detectrendering.call(this, ctx);
            var color = ctx.getImageData(x, y, 1, 1).data;
            return this._colorManager.getSpriteByColor(color);
        },
        _touchstartPropagation: function(e) {
            var sp = this._getEntityByPosition(e.x, e.y);
            if (sp) {
                this._touching = sp;
                propagationUp.call(this._touching, e, this.parentNode);
            } else {
                sp = null;
            }
            return sp;
        },
        _touchmovePropagation: function(e) {
            if (this._touching != null) {
                propagationUp.call(this._touching, e, this.parentNode);
            }
        },
        _touchendPropagation: function(e) {
            if (this._touching != null) {
                propagationUp.call(this._touching, e, this.parentNode);
                this._touching = null;
            }
        },
        /**
         * rotation of group
         * @see enchant.CanvasGroup.originX
         * @see enchant.CanvasGroup.originY
         * @type {Number}
         */
        rotation: {
            get: function() {
                return this._rotation;
            },
            set: function(rot) {
                this._rotation = rot;
                this._dirty = true;
            }
        },
        /**
         * scaling of group in the direction of x axis
         * @see enchant.CanvasGroup.originX
         * @see enchant.CanvasGroup.originY
         * @type {Number}
         */
        scaleX: {
            get: function() {
                return this._scaleX;
            },
            set: function(scale) {
                this._scaleX = scale;
                this._dirty = true;
            }
        },
        /**
         * scaling of group in the direction of y axis
         * @see enchant.CanvasGroup.originX
         * @see enchant.CanvasGroup.originY
         * @type {Number}
         */
        scaleY: {
            get: function() {
                return this._scaleY;
            },
            set: function(scale) {
                this._scaleY = scale;
                this._dirty = true;
            }
        },
        addChild: function(node) {
            this.childNodes.push(node);
            node.parentNode = this;
            node.dispatchEvent(new enchant.Event('added'));
            if (this.scene) {
                node.scene = this.scene;
                var e = new enchant.Event('addedtoscene');
                _onaddedtoscene.call(node, e, this._colorManager);
            }
        },
        insertBefore: function(node, reference) {
            var i = this.childNodes.indexOf(reference);
            if (i !== -1) {
                this.childNodes.splice(i, 0, node);
                node.parentNode = this;
                node.dispatchEvent(new enchant.Event('added'));
                if (this.scene) {
                    node.scene = this.scene;
                    var e = new enchant.Event('addedtoscene');
                    _onaddedtoscene.call(node, e, this._colorManager);
                }
            } else {
                this.addChild(node);
            }
        },
        removeChild: function(node) {
            var i;
            if ((i = this.childNodes.indexOf(node)) !== -1) {
                this.childNodes.splice(i, 1);
            }
            node.parentNode = null;
            node.dispatchEvent(new enchant.Event('removed'));
            if (this.scene) {
                node.scene = null;
                var e = new enchant.Event('removedfromscene');
                _onremovedfromscene.call(node, e, this._colorManager);
            }
        }
    });

    var RENDER_OFFSET = 0;
    var canvasGroupInstances = [];
    var touchingEntity = null;
    var touchingGroup = null;
    var _touchstartFromDom = function(e) {
        var game = enchant.Game.instance;
        var group;
        for (var i = canvasGroupInstances.length - 1; i >= 0; i--) {
            group = canvasGroupInstances[i];
            if (group.scene !== game.currentScene) {
                continue;
            }
            var sp = group._touchstartPropagation(e);
            if (sp) {
                touchingEntity = sp;
                touchingGroup = group;
                return;
            }
        }
    };
    var _touchmoveFromDom = function(e) {
        if (touchingGroup != null) {
            touchingGroup._touchmovePropagation(e);
        }
    };
    var _touchendFromDom = function(e) {
        if (touchingGroup != null) {
            touchingGroup._touchendPropagation(e);
            touchingEntity = null;
            touchingGroup = null;
        }
    };

    enchant.Map.prototype.cvsRender = function(ctx) {
        var game = enchant.Game.instance;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var cvs = this._element.firstChild;
        ctx.drawImage(cvs, 0, 0, game.width, game.height);
        ctx.restore();
    };

    enchant.Sprite.prototype.cvsRender = function(ctx) {
        var img, imgdata, row, frame;
        var sx, sy, sw, sh;
        if (this._image) {
            frame = Math.abs(this._frame) || 0;
            img = this._image;
            imgdata = img._element;
            row = img.width / this._width | 0;
            sx = (frame % row | 0) * this._width;
            sy = (frame / row | 0) * this._height % img.height;
            sy = Math.min(sy, img.height - this._height);
            sw = Math.min(img.width - sx, this._width);
            sh = Math.min(img.height - sy, this._height);
            ctx.drawImage(imgdata, sx, sy, sw, sh, RENDER_OFFSET, RENDER_OFFSET, this._width + RENDER_OFFSET, this._height + RENDER_OFFSET);
        }
    };

    enchant.Label.prototype.cvsRender = function(ctx) {
        if (this.text) {
            ctx.textBaseline = 'top';
            ctx.font = this.font;
            ctx.fillStyle = this.color || '#000000';
            ctx.fillText(this.text, RENDER_OFFSET, RENDER_OFFSET, this.width + RENDER_OFFSET);
        }
    };

    var DetectColorManager = enchant.Class.create({
        initialize: function(reso, max) {
            this.reference = [];
            this.detectColorNum = 0;
            this.colorResolution = reso || 16;
            this.max = max || 1;
        },
        attachDetectColor: function(sprite) {
            this.detectColorNum += 1;
            this.reference[this.detectColorNum] = sprite;
            return this._createNewColor();
        },
        detachDetectColor: function(sprite) {
            var i = this.reference.indexOf(sprite);
            if (i !== -1) {
                this.reference[i] = null;
            }
        },
        _createNewColor: function() {
            var n = this.detectColorNum;
            var C = this.colorResolution;
            var d = C / this.max;
            return [
                parseInt((n / C / C) % C, 10) / d,
                parseInt((n / C) % C, 10) / d,
                parseInt(n % C, 10) / d, 1.0
            ];
        },
        _decodeDetectColor: function(color) {
            var C = this.colorResolution;
            return ~~(color[0] * C * C * C / 256) +
                ~~(color[1] * C * C / 256) +
                ~~(color[2] * C / 256);
        },
        getSpriteByColor: function(color) {
            return this.reference[this._decodeDetectColor(color)];
        }
    });

    var nodesWalker = function(pre, post) {
        pre = pre || function() {
        };
        post = post || function() {
        };
        var walker = function() {
            pre.apply(this, arguments);
            var child;
            if (this.childNodes) {
                for (var i = 0, l = this.childNodes.length; i < l; i++) {
                    child = this.childNodes[i];
                    walker.apply(child, arguments);
                }
            }
            post.apply(this, arguments);
        };
        return walker;
    };

    var makeTransformMatrix = function(node, dest) {
        var x = node.x;
        var y = node.y;
        var width = node.width || 0;
        var height = node.height || 0;
        var rotation = node.rotation || 0;
        var scaleX = (typeof node.scaleX === 'number') ? node.scaleX : 1;
        var scaleY = (typeof node.scaleY === 'number') ? node.scaleY : 1;
        var theta = Math.PI * rotation / 180;
        var tmpcos = Math.cos(theta);
        var tmpsin = Math.sin(theta);
        var w = (typeof node.originX === 'number') ? node.originX : width / 2;
        var h = (typeof node.originY === 'number') ? node.originY : height / 2;
        var a = scaleX * tmpcos;
        var b = scaleX * tmpsin;
        var c = scaleY * tmpsin;
        var d = scaleY * tmpcos;
        dest[0] = scaleX * tmpcos;
        dest[1] = scaleX * tmpsin;
        dest[2] = -scaleY * tmpsin;
        dest[3] = scaleY * tmpcos;
        dest[4] = (-a * w + c * h + x + w);
        dest[5] = (-b * w - d * h + y + h);
    };

    var dirtyCheck = function(node) {
        if (node.__dirty ||
            node._cvsCache.x !== node.x ||
            node._cvsCache.y !== node.y ||
            node._cvsCache.width !== node.width ||
            node._cvsCache.height !== node.height
            ) {
            makeTransformMatrix(node, node._cvsCache.matrix);
            node.__dirty = false;
            node._cvsCache.x = node.x;
            node._cvsCache.y = node.y;
            node._cvsCache.width = node.width;
            node._cvsCache.height = node.height;
        }
    };

    var alpha = function(ctx, node) {
        if (node.alphaBlending) {
            ctx.globalCompositeOperation = node.alphaBlending;
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = (typeof node.opacity === 'number') ? node.opacity : 1.0;
    };

    var transform = function(ctx, node) {
        dirtyCheck(node);
        ctx.transform.apply(ctx, node._cvsCache.matrix);
    };

    var render = function(ctx, node) {
        var game = enchant.Game.instance;
        if (typeof node.visible !== 'undefined' && !node.visible) {
            return;
        }
        if (node.backgroundColor) {
            ctx.fillStyle = node.backgroundColor;
            ctx.fillRect(RENDER_OFFSET, RENDER_OFFSET, node.width + RENDER_OFFSET, node.height + RENDER_OFFSET);
        }

        if (node.cvsRender) {
            node.cvsRender(ctx);
        }

        if (game._debug) {
            if (node instanceof enchant.Label || node instanceof enchant.Sprite) {
                ctx.strokeStyle = '#ff0000';
            } else {
                ctx.strokeStyle = '#0000ff';
            }
            ctx.strokeRect(RENDER_OFFSET, RENDER_OFFSET, node.width + RENDER_OFFSET, node.height + RENDER_OFFSET);
        }
    };

    var rendering = nodesWalker(
        function(ctx) {
            ctx.save();
            alpha(ctx, this);
            transform(ctx, this);
            render(ctx, this);
        },
        function(ctx) {
            ctx.restore();
        }
    );

    var array2hexrgb = function(arr) {
        return '#' + ("00" + Number(parseInt(arr[0], 10)).toString(16)).slice(-2) +
            ("00" + Number(parseInt(arr[1], 10)).toString(16)).slice(-2) +
            ("00" + Number(parseInt(arr[2], 10)).toString(16)).slice(-2);
    };

    var detectrender = function(ctx, node) {
        ctx.fillStyle = node._cvsCache.detectColor;
        ctx.fillRect(0, 0, node.width, node.height);
    };

    var detectrendering = nodesWalker(
        function(ctx) {
            ctx.save();
            transform(ctx, this);
            detectrender(ctx, this);
        },
        function(ctx) {
            ctx.restore();
        }
    );

    var is__dirty = function() {
        if (this._dirty) {
            this.__dirty = true;
        } else {
            this.__dirty = false;
        }
    };

    var attachCache = function(colorManager) {
        if (this._cvsCache) {
            return;
        }
        this.addEventListener('render', is__dirty);
        this._cvsCache = {};
        this._cvsCache.matrix = [];
        this._cvsCache.detectColor = array2hexrgb(colorManager.attachDetectColor(this));
    };

    var detachCache = function(colorManager) {
        if (!this._cvsCache) {
            return;
        }
        this.removeEventListener('render', is__dirty);
        colorManager.detachDetectColor(this);
        delete this._cvsCache;
    };

    var checkCache = nodesWalker(
        function(colorManager) {
            attachCache.call(this, colorManager);
        }
    );

    var _onaddedtoscene = nodesWalker(
        function(e, colorManager) {
            this.dispatchEvent(e);
            attachCache.call(this, colorManager);
        }
    );

    var _onremovedfromscene = nodesWalker(
        function(e, colorManager) {
            this.dispatchEvent(e);
            detachCache.call(this, colorManager);
        }
    );

    var propagationDown = nodesWalker(
        function(e) {
            this.dispatchEvent(e);
        }
    );

    var propagationUp = function(e, end) {
        this.dispatchEvent(e);
        if (this.parentNode && this.parentNode !== end) {
            propagationUp.call(this.parentNode, e, end);
        }
    };
}());

/**
 * @scope enchant.Scene.prototype
 */
enchant.Scene = enchant.Class.create(enchant.Group, {
    /**
     * Class that becomes route for display object tree.
     *
     * @example
     *   var scene = new Scene();
     *   scene.addChild(player);
     *   scene.addChild(enemy);
     *   game.pushScene(scene);
     *
     * @constructs
     * @extends enchant.Group
     */
    initialize: function() {
        enchant.Group.call(this);

        this._element = document.createElement('div');
        this._element.style.position = 'absolute';
        this._element.style.overflow = 'hidden';
        this._element.style.width = (this.width = enchant.Game.instance.width) + 'px';
        this._element.style.height = (this.height = enchant.Game.instance.height) + 'px';
        this._element.style[enchant.ENV.VENDOR_PREFIX + 'TransformOrigin'] = '0 0';
        this._element.style[enchant.ENV.VENDOR_PREFIX + 'Transform'] = 'scale(' + enchant.Game.instance.scale + ')';

        this.scene = this;

        var that = this;
        if (enchant.ENV.TOUCH_ENABLED) {
            this._element.addEventListener('touchstart', function(e) {
                var touches = e.touches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchstart');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);
                    that.dispatchEvent(e);
                }
            }, false);
            this._element.addEventListener('touchmove', function(e) {
                var touches = e.touches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchmove');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);
                    that.dispatchEvent(e);
                }
            }, false);
            this._element.addEventListener('touchend', function(e) {
                var touches = e.changedTouches;
                for (var i = 0, len = touches.length; i < len; i++) {
                    e = new enchant.Event('touchend');
                    e.identifier = touches[i].identifier;
                    e._initPosition(touches[i].pageX, touches[i].pageY);
                    that.dispatchEvent(e);
                }
            }, false);
        }
        this._element.addEventListener('mousedown', function(e) {
            var x = e.pageX;
            var y = e.pageY;
            e = new enchant.Event('touchstart');
            e.identifier = enchant.Game.instance._mousedownID;
            e._initPosition(x, y);
            that.dispatchEvent(e);
            that._mousedown = true;
        }, false);
        enchant.Game.instance._element.addEventListener('mousemove', function(e) {
            if (!that._mousedown) {
                return;
            }
            var x = e.pageX;
            var y = e.pageY;
            e = new enchant.Event('touchmove');
            e.identifier = enchant.Game.instance._mousedownID;
            e._initPosition(x, y);
            that.dispatchEvent(e);
        }, false);
        enchant.Game.instance._element.addEventListener('mouseup', function(e) {
            if (!that._mousedown) {
                return;
            }
            var x = e.pageX;
            var y = e.pageY;
            e = new enchant.Event('touchend');
            e.identifier = enchant.Game.instance._mousedownID;
            e._initPosition(x, y);
            that.dispatchEvent(e);
            that._mousedown = false;
        }, false);
    },
    /**
     * Scene background color.
     * Can indicate same format as CSS 'color' property.
     * @type {String}
     */
    backgroundColor: {
        get: function() {
            return this._backgroundColor;
        },
        set: function(color) {
            this._element.style.backgroundColor = this._backgroundColor = color;
        }
    },
    _updateCoordinate: function() {
        this._offsetX = this._x;
        this._offsetY = this._y;
        for (var i = 0, len = this.childNodes.length; i < len; i++) {
            this.childNodes[i]._updateCoordinate();
        }
    }
});
/**
 * @scope enchant.Surface.prototype
 */
enchant.Surface = enchant.Class.create(enchant.EventTarget, {
    /**
     * Class that wraps canvas elements.
     *
     * Can set Sprite and Map's image properties and display.
     * Uses context properties when you wish to access Canvas API.
     *
     * @example
     *   // Creates Sprite that displays a circle.
     *   var ball = new Sprite(50, 50);
     *   var surface = new Surface(50, 50);
     *   surface.context.beginPath();
     *   surface.context.arc(25, 25, 25, 0, Math.PI*2, true);
     *   surface.context.fill();
     *   ball.image = surface;
     *
     * @param {Number} width Surface width.
     * @param {Number} height Surface height.
     * @constructs
     */
    initialize: function(width, height) {
        enchant.EventTarget.call(this);

        var game = enchant.Game.instance;

        /**
         * Surface width.
         * @type {Number}
         */
        this.width = width;
        /**
         * Surface height.
         * @type {Number}
         */
        this.height = height;
        /**
         * Surface drawing context.
         * @type {CanvasRenderingContext2D}
         */
        this.context = null;

        var id = 'enchant-surface' + game._surfaceID++;
        if (document.getCSSCanvasContext) {
            this.context = document.getCSSCanvasContext('2d', id, width, height);
            this._element = this.context.canvas;
            this._css = '-webkit-canvas(' + id + ')';
            var context = this.context;
        } else if (document.mozSetImageElement) {
            this._element = document.createElement('canvas');
            this._element.width = width;
            this._element.height = height;
            this._css = '-moz-element(#' + id + ')';
            this.context = this._element.getContext('2d');
            document.mozSetImageElement(id, this._element);
        } else {
            this._element = document.createElement('canvas');
            this._element.width = width;
            this._element.height = height;
            this._element.style.position = 'absolute';
            this.context = this._element.getContext('2d');

            enchant.ENV.CANVAS_DRAWING_METHODS.forEach(function(name) {
                var method = this.context[name];
                this.context[name] = function() {
                    method.apply(this, arguments);
                    this._dirty = true;
                };
            }, this);
        }
    },
    /**
     * Acquires 1 pixel from Surface.
     * @param {Number} x Acquired pixel's x coordinates.
     * @param {Number} y Acquired pixel's y coordinates.
     * @return {Array.<Number>} An array that holds pixel information in [r, g, b, a] format.
     */
    getPixel: function(x, y) {
        return this.context.getImageData(x, y, 1, 1).data;
    },
    /**
     * Surfaceに1ピクセル設定する.
     * @param {Number} x Set pixel's x coordinates.
     * @param {Number} y Set pixel's y coordinates.
     * @param {Number} r Set pixel's r level.
     * @param {Number} g Set pixel's g level.
     * @param {Number} b Set pixel's b level.
     * @param {Number} a Set pixel's transparency.
     */
    setPixel: function(x, y, r, g, b, a) {
        var pixel = this.context.createImageData(1, 1);
        pixel.data[0] = r;
        pixel.data[1] = g;
        pixel.data[2] = b;
        pixel.data[3] = a;
        this.context.putImageData(pixel, x, y);
    },
    /**
     * Clears all Surface pixels and sets transparency level 0 to black.
     */
    clear: function() {
        this.context.clearRect(0, 0, this.width, this.height);
    },
    /**
     * Draws indicated Surface in argument corresponding to Surface.
     *
     * Wraps Canvas API drawImage, and sets drawing rectangle to same format.
     *
     * @example
     *   var src = game.assets['src.gif'];
     *   var dst = new Surface(100, 100);
     *   dst.draw(src);         // Draws source at (0, 0)
     *   dst.draw(src, 50, 50); // Draws source at (50, 50)
     *   // Draws just 30 horizontal and vertical pixels of source at (50, 50)
     *   dst.draw(src, 50, 50, 30, 30);
     *   // Reduces the horizontal and vertical 40 pixel image at source (10, 10) to a horizontal and vertical 30 pixel image at (50, 50)
     *   dst.draw(src, 10, 10, 40, 40, 50, 50, 30, 30);
     *
     * @param {enchant.Surface} image Surface used in drawing.
     */
    draw: function(image) {
        image = image._element;
        if (arguments.length === 1) {
            this.context.drawImage(image, 0, 0);
        } else {
            var args = arguments;
            args[0] = image;
            this.context.drawImage.apply(this.context, args);
        }
    },
    /**
     * Copies Surface.
     * @return {enchant.Surface} Copied Surface.
     */
    clone: function() {
        var clone = new enchant.Surface(this.width, this.height);
        clone.draw(this);
        return clone;
    },
    /**
     * Creates data scheme URL from Surface.
     * @return {String} Data scheme URL that shows Surface.
     */
    toDataURL: function() {
        var src = this._element.src;
        if (src) {
            if (src.slice(0, 5) === 'data:') {
                return src;
            } else {
                return this.clone().toDataURL();
            }
        } else {
            return this._element.toDataURL();
        }
    }
});

/**
 * Loads image and creates Surface object.
 *
 * Surface created with this method does not allow access to wrap img elements context properties,
 * or image operation via Canvas API called up by draw,clear, getPixel, setPixel and other methods.
 * However it is possible to make draw method arguments, and you can operate images drawn on other surfaces
 * (when loading in cross domain, pixel acquisition and other image manipulation is limited).
 *
 *
 *
 * @param {String} src Loaded image file path.
 * @static
 */
enchant.Surface.load = function(src) {
    var image = new Image();
    var surface = Object.create(enchant.Surface.prototype, {
        context: { value: null },
        _css: { value: 'url(' + src + ')' },
        _element: { value: image }
    });
    enchant.EventTarget.call(surface);
    image.src = src;
    image.onerror = function() {
        throw new Error('Cannot load an asset: ' + image.src);
    };
    image.onload = function() {
        surface.width = image.width;
        surface.height = image.height;
        surface.dispatchEvent(new enchant.Event('load'));
    };
    return surface;
};
/**
 * @scope enchant.Sound.prototype
 */
enchant.Sound = enchant.Class.create(enchant.EventTarget, {
    /**
     * Class to wrap audio elements.
     *
     * Safari, Chrome, Firefox, Opera, and IE all play MP3 files
     * (Firefox and Opera play via Flash). WAVE files can be played on
     * Safari, Chrome, Firefox, and Opera. When the browser is not compatible with
     * the codec the file will not fully play.
     *
     * Instances are created not via constructor but via enchant.Sound.load.
     *
     * @constructs
     */
    initialize: function() {
        enchant.EventTarget.call(this);
        /**
         * Sound play time (seconds).
         * @type {Number}
         */
        this.duration = 0;
        throw new Error("Illegal Constructor");
    },
    /**
     * Begin playing.
     */
    play: function() {
        if (this._element){
            this._element.play();
        }
    },
    /**
     * Interrupt playing.
     */
    pause: function() {
        if (this._element){
            this._element.pause();
        }
    },
    /**
     * Stop playing.
     */
    stop: function() {
        this.pause();
        this.currentTime = 0;
    },
    /**
     * Copy Sound.
     * @return {enchant.Sound} Copied Sound.
     */
    clone: function() {
        var clone;
        if (this._element instanceof Audio) {
            clone = Object.create(enchant.Sound.prototype, {
                _element: { value: this._element.cloneNode(false) },
                duration: { value: this.duration }
            });
        } else if (enchant.ENV.USE_FLASH_SOUND) {
            return this;
        } else {
            clone = Object.create(enchant.Sound.prototype);
        }
        enchant.EventTarget.call(clone);
        return clone;
    },
    /**
     * Current play point (seconds).
     * @type {Number}
     */
    currentTime: {
        get: function() {
            return this._element ? this._element.currentTime : 0;
        },
        set: function(time) {
            if (this._element){
                this._element.currentTime = time;
            }
        }
    },
    /**
     * Volume. 0 (mute) ～ 1 (full volume).
     * @type {Number}
     */
    volume: {
        get: function() {
            return this._element ? this._element.volume : 1;
        },
        set: function(volume) {
            if (this._element){
                this._element.volume = volume;
            }
        }
    }
});

/**
 * Load audio file, create Surface object.
 *
 * @param {String} src Path of loaded audio file.
 * @param {String} [type] MIME Type of audio file.
 * @static
 */
enchant.Sound.load = function(src, type) {
    if (type == null) {
        var ext = enchant.Game.findExt(src);
        if (ext) {
            type = 'audio/' + ext;
        } else {
            type = '';
        }
    }
    type = type.replace('mp3', 'mpeg').replace('m4a', 'mp4');

    var sound = Object.create(enchant.Sound.prototype);
    enchant.EventTarget.call(sound);
    var audio = new Audio();
    if (!enchant.ENV.SOUND_ENABLED_ON_MOBILE_SAFARI &&
        enchant.ENV.VENDOR_PREFIX === 'webkit' && enchant.ENV.TOUCH_ENABLED) {
        window.setTimeout(function() {
            sound.dispatchEvent(new enchant.Event('load'));
        }, 0);
    } else {
        if (!enchant.ENV.USE_FLASH_SOUND && audio.canPlayType(type)) {
            audio.src = src;
            audio.load();
            audio.autoplay = false;
            audio.onerror = function() {
                throw new Error('Cannot load an asset: ' + audio.src);
            };
            audio.addEventListener('canplaythrough', function() {
                sound.duration = audio.duration;
                sound.dispatchEvent(new enchant.Event('load'));
            }, false);
            sound._element = audio;
        } else if (type === 'audio/mpeg') {
            var embed = document.createElement('embed');
            var id = 'enchant-audio' + enchant.Game.instance._soundID++;
            embed.width = embed.height = 1;
            embed.name = id;
            embed.src = 'sound.swf?id=' + id + '&src=' + src;
            embed.allowscriptaccess = 'always';
            embed.style.position = 'absolute';
            embed.style.left = '-1px';
            sound.addEventListener('load', function() {
                Object.defineProperties(embed, {
                    currentTime: {
                        get: function() {
                            return embed.getCurrentTime();
                        },
                        set: function(time) {
                            embed.setCurrentTime(time);
                        }
                    },
                    volume: {
                        get: function() {
                            return embed.getVolume();
                        },
                        set: function(volume) {
                            embed.setVolume(volume);
                        }
                    }
                });
                sound._element = embed;
                sound.duration = embed.getDuration();
            });
            enchant.Game.instance._element.appendChild(embed);
            enchant.Sound[id] = sound;
        } else {
            window.setTimeout(function() {
                sound.dispatchEvent(new enchant.Event('load'));
            }, 0);
        }
    }
    return sound;
};
