/**
 * ColorPicker - pure JavaScript color picker.
 *
 * @author Andrej Hristoliubov https://anhr.github.io/AboutMe/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ColorPicker = {})));
}(this, (function (exports) { 'use strict';

/**
 * node.js version of the synchronous download of the file.
 * @author Andrej Hristoliubov https://anhr.github.io/AboutMe/
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
function myRequest(options) {
	this.loadXMLDoc = function () {
		var req;
		if (window.XMLHttpRequest) {
			req = new XMLHttpRequest();
			if (!req) throw "new XMLHttpRequest() failed!";
		} else if (window.ActiveXObject) {
			req = this.NewActiveXObject();
			if (!req) throw "NewActiveXObject() failed!";
		} else throw "myRequest.loadXMLDoc(...) failed!";
		return req;
	};
	this.NewActiveXObject = function () {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.6.0");
		} catch (e) {}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.3.0");
		} catch (e) {}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {}
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch (e) {}
		ErrorMessage('This browser does not support XMLHttpRequest. Probably, your security settings do not allow Web sites to use ActiveX controls installed on your computer. Refresh your Web page to find out the current status of your Web page or enable the "Initialize and script ActiveX controls not marked as safe" and "Run Active X controls and plug-ins" of the Security settings of the Internet zone of your browser.');
		return null;
	};
	this.XMLHttpRequestStart = function (onreadystatechange, async) {
		this.XMLHttpRequestStop();
		this.req.onreadystatechange = onreadystatechange;
		if ("onerror" in this.req) {
			this.req.onerror = function (event) {
				ErrorMessage("XMLHttpRequest error. url: " + this.url, false, false);
			};
		}
		this.XMLHttpRequestReStart(async);
	};
	this.getUrl = function () {
		if (typeof this.url == 'undefined' || this.url == null) {
			this.url = "XMLHttpRequest.xml";
		}
		return this.url + (this.params ? this.params : "");
	};
	this.XMLHttpRequestReStart = function (async) {
		try {
			if (typeof async == 'undefined') async = true;
			this.req.open("GET", this.getUrl(), async);
			if (async) {
				var timeout = (60 + 30) * 1000;
				if ("timeout" in this.req)
					this.req.timeout = timeout;
				if ("ontimeout" in this.req) this.req.ontimeout = function () {
					ErrorMessage('XMLHttpRequest timeout', false, false);
				};else {
					clearTimeout(this.timeout_id_SendReq);
					this.timeout_id_SendReq = setTimeout(function () {
						ErrorMessage('XMLHttpRequest timeout 2', false, false);
					}, timeout);
				}
			}
			this.req.send(null);
		} catch (e) {
			ErrorMessage(e.message + " url: " + this.url, false, false);
		}
	};
	this.XMLHttpRequestStop = function () {
		if (this.req == null) return;
		this.req.abort();
	};
	this.ProcessReqChange = function (processStatus200) {
		var req = this.req;
		switch (req.readyState) {
			case 4:
				{
					if (typeof req.status == "unknown") {
						consoleError('typeof XMLHttpRequest status == "unknown"');
						return true;
					}
					if (req.status == 200)
						{
							clearTimeout(this.timeout_id_SendReq);
							return processStatus200(this);
						}
					else {
							ErrorMessage("Invalid XMLHttpRequest status : " + req.status + " url: " + this.url);
						}
				}
				break;
			case 1:
			case 2:
			case 3:
				break;
			case 0:
			default:
				throw "processReqChange(); req.readyState = " + req.readyState;
				break;
		}
		return true;
	};
	this.processStatus200Error = function () {
		var error = this.GetElementText('error', true);
		if (error) {
			ErrorMessage(error);
			return true;
		}
		return false;
	};
	this.GetElementText = function (tagName, noDisplayErrorMessage) {
		var xmlhttp = this.req;
		if (!xmlhttp.responseXML) {
			if (noDisplayErrorMessage != true) ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); xmlhttp.responseXML is null.\nxmlhttp.responseText:\n' + xmlhttp.responseText);
			return null;
		}
		var element = xmlhttp.responseXML.getElementsByTagName(tagName);
		if (element.length == 0) {
			if (noDisplayErrorMessage != true) ErrorMessage('GetXMLElementText(xmlhttp, "' + tagName + '"); element.length == ' + element.length);
			return "";
		}
		var text = "";
		for (var i = 0; i < element.length; i++) {
			if (typeof element[i].textContent == 'undefined') {
				if (typeof element[i].text == 'undefined') {
					ErrorMessage('GetXMLElementText(xmlhttp, ' + tagName + '); element[' + i + '].text) == undefined');
					return '';
				}
				if (text != "") text += " ";
				text += element[i].text;
			} else text += element[i].textContent;
		}
		return text;
	};
	if (options.data) {
		this.req = options.data.req;
		this.url = options.data.url;
		this.params = options.data.params;
	} else {
		try {
			this.req = this.loadXMLDoc();
		} catch (e) {
			var message;
			if (typeof e.message == 'undefined') message = e;else message = e.message;
			ErrorMessage("Your browser is too old and is not compatible with our site.\n\n" + window.navigator.appName + " " + window.navigator.appVersion + "\n\n" + message);
			return;
		}
	}
	if (!this.req) {
		consoleError("Invalid myRequest.req: " + this.req);
		return;
	}
	function ErrorMessage(error) {
		console.error(error);
		options.onerror(error);
	}
}
function sync(url, options) {
	options = options || {};
	options.onload = options.onload || function () {};
	options.onerror = options.onerror || function () {};
	var response,
	    request = new myRequest(options);
	request.url = url;
	request.XMLHttpRequestStart(function () {
		request.ProcessReqChange(function (myRequest) {
			if (myRequest.processStatus200Error()) return;
			response = myRequest.req.responseText;
			console.log('loadFile.sync.onload() ' + url);
			options.onload(response, url);
			return;
		});
	}, false
	);
	return response;
}

/**
 * node.js version of the load JavaScript file
 * @author Andrej Hristoliubov https://anhr.github.io/AboutMe/
 *
 * Thanks to:
 *http://javascript.ru/forum/events/21439-dinamicheskaya-zagruzka-skriptov.html
 *https://learn.javascript.ru/onload-onerror
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
function sync$1(src, options) {
	options = options || {};
	options.onload = options.onload || function () {};
	options.onerror = options.onerror || function () {};
	options.appendTo = options.appendTo || document.getElementsByTagName('head')[0];
	if (isScriptExists(options.appendTo, src)) {
		options.onload();
		return;
	}
	if (src instanceof Array) {
		var error,
		    optionsItem = {
			appendTo: options.appendTo,
			tag: options.tag,
			onload: function onload(response, url) {
				console.log('loadScript.sync.onload: ' + url);
			},
			onerror: function onerror(str) {
				options.onerror(str);
				error = str;
			}
		};
		for (var i = 0; i < src.length; i++) {
			var item = src[i];
			loadScriptBase(function (script) {
				script.setAttribute("id", item);
				script.innerHTML = sync(item, optionsItem);
			}, optionsItem);
			if (error !== undefined) break;
		}
		if (error === undefined) options.onload();
	} else loadScriptBase(function (script) {
		script.setAttribute("id", src);
		script.innerHTML = sync(src, options);
	}, options);
}
function async(src, options) {
	options = options || {};
	options.appendTo = options.appendTo || document.getElementsByTagName('head')[0];
	options.onload = options.onload || function () {};
	var isrc;
	function async(srcAsync) {
		function next() {
			if (src instanceof Array && isrc < src.length - 1) {
				isrc++;
				async(src[isrc]);
			} else options.onload();
		}
		if (isScriptExists(options.appendTo, srcAsync, options.onload)) {
			next();
			return;
		}
		loadScriptBase(function (script) {
			script.setAttribute("id", srcAsync);
			function _onload() {
				console.log('loadScript.async.onload() ' + srcAsync);
				if (options.onload !== undefined) {
					next();
				}
			}
			if (script.readyState && !script.onload) {
				script.onreadystatechange = function () {
					if (script.readyState == "complete") {
						if (options.onload !== undefined) options.onload();
					}
					if (script.readyState == "loaded") {
						setTimeout(options.onload, 0);
						this.onreadystatechange = null;
					}
				};
			} else {
				script.onload = _onload;
				script.onerror = function (e) {
					var str = 'loadScript: "' + this.src + '" failed';
					if (options.onerror !== undefined) options.onerror(str, e);
					console.error(str);
				};
			}
			script.src = srcAsync;
		}, options);
	}
	if (src instanceof Array) {
		isrc = 0;
		async(src[isrc]);
	} else async(src);
}
function loadScriptBase(callback, options) {
	options.tag = options.tag || {};
	if (typeof options.tag === "string") {
		switch (options.tag) {
			case 'style':
				options.tag = {
					name: 'style',
					attribute: {
						name: 'rel',
						value: 'stylesheet'
					}
				};
				break;
			default:
				console.error('Invalid options.tag: ' + options.tag);
				return;
		}
	}
	options.tag.name = options.tag.name || 'script';
	var script = document.createElement(options.tag.name);
	options.tag.attribute = options.tag.attribute || {};
	options.tag.attribute.name = options.tag.attribute.name || "type";
	options.tag.attribute.value = options.tag.attribute.value || 'text/javascript';
	script.setAttribute(options.tag.attribute.name, options.tag.attribute.value);
	callback(script);
	options.appendTo.appendChild(script);
}
function isScriptExists(elParent, srcAsync, onload) {
	var scripts = elParent.querySelectorAll('script');
	for (var i = 0; i < scripts.length; i++) {
		var child = scripts[i];
		if (child.id === srcAsync) {
			return true;
		}
	}
	return false;
}

var loadScript = {
  sync: sync$1,
  async: async
};

/**
 * ColorPicker - pure JavaScript color picker.
 *
 * @author Andrej Hristoliubov https://anhr.github.io/AboutMe/
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
var optionsStyle = {
	tag: 'style'
};
loadScript.sync('https://raw.githack.com/anhr/colorPicker/master/colorpicker.css', optionsStyle);
var type = window.SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML";
var svgNS = 'http://www.w3.org/2000/svg';
var uniqID = 0;
function create(elSliderWrapper, options) {
	options = options || {};
	options.orientation = options.orientation || 'horizontal';
	options.style = options.style || {};
	options.style.width = options.style.width || (options.orientation === 'horizontal' ? 200 : 30);
	options.style.height = options.style.height || (options.orientation === 'horizontal' ? 30 : 200);
	if (elSliderWrapper instanceof HTMLDivElement !== true) {
		if (typeof elSliderWrapper !== "string") {
			console.error('ColorPicker.create: invalid elSliderWrapper = ' + elSliderWrapper);
			return;
		}
		elSliderWrapper = document.getElementById(elSliderWrapper);
		if (elSliderWrapper === null) {
			console.error('ColorPicker.create: invalid elSliderWrapper = ' + elSliderWrapper);
			return;
		}
	}
	elSliderWrapper.classList.add('slider-wrapper');
	elSliderWrapper.style.width = options.style.width + 'px';
	elSliderWrapper.style.height = options.style.height + 'px';
	var slideElement = document.createElement('div');
	elSliderWrapper.appendChild(slideElement);
	var slideIndicator;
	if (options.sliderIndicator !== undefined) {
		slideIndicator = document.createElement('div');
		slideIndicator.className = 'slider-indicator';
		if (options.orientation === "horizontal") slideIndicator.style.width = '10px';else slideIndicator.style.height = '10px';
		elSliderWrapper.appendChild(slideIndicator);
		slideIndicator.style.pointerEvents = 'none';
	}
	function positionIndicators(mouseSlide) {
		if (mouseSlide && slideIndicator !== undefined) {
			if (options.orientation === "horizontal") {
				slideIndicator.style.top = '0px';
				slideIndicator.style.left = mouseSlide.x - slideIndicator.offsetWidth / 2 + 'px';
			} else {
				slideIndicator.style.left = '0px';
				slideIndicator.style.top = mouseSlide.y - slideIndicator.offsetHeight / 2 + 'px';
			}
		}
	}
	if (type == 'SVG') {
		var $ = function $(el, attrs, children) {
			el = document.createElementNS(svgNS, el);
			for (var key in attrs) {
				el.setAttribute(key, attrs[key]);
			}if (Object.prototype.toString.call(children) != '[object Array]') children = [children];
			var i = 0,
			    len = children[0] && children.length || 0;
			for (; i < len; i++) {
				el.appendChild(children[i]);
			}return el;
		};
		var Palette = function Palette() {
			function paletteitem(percent, r, g, b) {
				return {
					percent: percent,
					r: r,
					g: g,
					b: b
				};
			}
			var arrayPalette = [
			new paletteitem(0, 0x00, 0x00, 0xFF),
			new paletteitem(33, 0x00, 0xFF, 0x00),
			new paletteitem(66, 0xFF, 0xFF, 0x00),
			new paletteitem(100, 0xFF, 0xFF, 0xFF)];
			this.getPalette = function () {
				var palette = [];
				arrayPalette.forEach(function (item) {
					palette.unshift($('stop', {
						offset: 100 - item.percent + '%', 'stop-color': '#'
						+ ("0" + Number(item.r).toString(16)).slice(-2).toUpperCase() + ("0" + Number(item.g).toString(16)).slice(-2).toUpperCase() + ("0" + Number(item.b).toString(16)).slice(-2).toUpperCase(),
						'stop-opacity': '1'
					}));
				});
				return palette;
			};
			this.hsv2rgb = function (percent) {
				if (percent < 0 || percent > 100) {
					return;
				}
				var itemPrev;
				for (var i = 0; i < arrayPalette.length; i++) {
					var item = arrayPalette[i];
					if (itemPrev === undefined) itemPrev = item;
					if (percent >= itemPrev.percent && percent <= item.percent) {
						var color = function color(percentPrev, prev, percentItem, item) {
							var percentD = percentItem - percentPrev;
							if (percentD === 0) return prev;
							return prev + (item - prev) / percentD * (percent - percentPrev);
						};
						var r = color(itemPrev.percent, itemPrev.r, item.percent, item.r),
						    g = color(itemPrev.percent, itemPrev.g, item.percent, item.g),
						    b = color(itemPrev.percent, itemPrev.b, item.percent, item.b);
						return {
							r: r,
							g: g,
							b: b,
							hex: "#" + (16777216 | b | g << 8 | r << 16).toString(16).slice(1), percent: percent
						};
					}
					itemPrev = item;
				}
			};
		};
		var palette = new Palette();
		var slide = $('svg', {
			xmlns: 'http://www.w3.org/2000/svg',
			version: '1.1',
			width: '100%',
			height: '100%'
		}, [$('defs', {}, $('linearGradient', {
			id: 'gradient-hsv',
			x1: options.orientation === "horizontal" ? '100%' : '0%',
			y1: options.orientation === "horizontal" ? '0%' : '100%',
			x2: '0%',
			y2: '0%'
		}, palette.getPalette())), $('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)' })]);
		slide.style.cursor = options.orientation === "horizontal" ? 'e-resize' : 's-resize';
		if (slideIndicator !== undefined) slideIndicator.style.cursor = slide.style.cursor;
		var slideClone = slide.cloneNode(true);
		var hsvGradient = slideClone.getElementsByTagName('linearGradient')[0];
		var hsvRect = slideClone.getElementsByTagName('rect')[0];
		hsvGradient.id = 'gradient-hsv-' + uniqID;
		hsvRect.setAttribute('fill', 'url(#' + hsvGradient.id + ')');
		slideElement.appendChild(slideClone);
		slideClone.style.height = elSliderWrapper.offsetHeight + 'px';
		positionIndicators({ x: 0, y: 0 });
		if (slideIndicator !== undefined) {
			if (options.orientation === "horizontal") slideIndicator.style.height = options.style.height - 2 + 'px';else slideIndicator.style.width = options.style.width - 2 + 'px';
		}
		uniqID++;
	} else {
		console.error('Under constraction');
	}
	if (slideIndicator !== undefined) {
		var slideListener = function slideListener(ctx) {
			return function (evt) {
				if (mouseout) return;
				evt = evt || window.event;
				function mousePosition(evt) {
					if (window.event && window.event.contentOverflow !== undefined) {
						return { x: window.event.offsetX, y: window.event.offsetY };
					}
					if (evt.offsetX !== undefined && evt.offsetY !== undefined) {
						return { x: evt.offsetX, y: evt.offsetY };
					}
					var wrapper = evt.target.parentNode.parentNode;
					return { x: evt.layerX - wrapper.offsetLeft, y: evt.layerY - wrapper.offsetTop };
				}
				var mouse = mousePosition(evt),
				    mousePosition = mouse.x;
				ctx.h = mousePosition / slideElement.offsetWidth * 360;
				function hsv2rgb(hsv) {
					return palette.hsv2rgb(hsv.h * 100 / 360);
				}
				var c = hsv2rgb({ h: ctx.h, s: ctx.s, v: ctx.v });
				if (c !== undefined) {
					positionIndicators(mouse);
					if (options.sliderIndicator.callback !== undefined) {
						options.sliderIndicator.callback(c);
					}
				}
			};
		};
		var addEventListener = function addEventListener(element, event, listener) {
			if (element === null) return;
			if (element.attachEvent) {
				element.attachEvent('on' + event, listener);
			} else if (element.addEventListener) {
				element.addEventListener(event, listener, false);
			}
		};
		var enableDragging = function enableDragging(ctx, listener) {
			var element = slideElement;
			addEventListener(element, 'mousedown', function (evt) {
				var mouseup = 'mouseup',
				    mousemove = 'mousemove';
				function onMouseUp() {
					function removeEventListener(element, event, listener) {
						if (element === null) return;
						if (element.detachEvent) {
							element.detachEvent('on' + event, listener);
						} else if (element.removeEventListener) {
							element.removeEventListener(event, listener, false);
						}
					}
					removeEventListener(window, mouseup, onMouseUp);
					removeEventListener(window, mousemove, listener);
				}
				addEventListener(window, mouseup, onMouseUp);
				addEventListener(window, mousemove, listener);
			});
			addEventListener(element, 'mouseout', function (evt) {
				mouseout = true;
			});
			addEventListener(element, 'mouseover', function (evt) {
				mouseout = false;
			});
		};
		var mouseout = false;
		addEventListener(slideElement, 'click', slideListener(this));
		enableDragging(this, slideListener(this));
	}
}

exports.create = create;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=colorpicker.js.map
