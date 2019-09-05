/**
 * ColorPicker - pure JavaScript color picker.
 *
 * @author Andrej Hristoliubov https://anhr.github.io/AboutMe/
 * 
 * Thanks to FlexiColorPicker https://github.com/DavidDurman/FlexiColorPicker
 *
 * @copyright 2011 Data Arts Team, Google Creative Lab
 *
 * @license under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//Please download https://github.com/anhr/loadScriptNodeJS into ../loadScriptNodeJS folder
import loadScript from '../loadScriptNodeJS/loadScript.js';
var optionsStyle = {

	//style rel="stylesheet"
	tag: 'style'

}
loadScript.sync( 'https://raw.githack.com/anhr/colorPicker/master/colorpicker.css', optionsStyle );
//loadScript.sync( 'http://localhost/threejs/nodejs/colorpicker/colorpicker.css', optionsStyle );
//loadScript.sync( '../colorpicker.css', optionsStyle );

var type = ( window.SVGAngle || document.implementation.hasFeature( "http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1" ) ? "SVG" : "VML" ),
//	hueOffset = 15,
	svgNS = 'http://www.w3.org/2000/svg', uniqID = 0;
export var paletteIndexes = {

	BGRW: 0,//blue, green, red, white palette
	monochrome: 1,
	bidirectional: 2,//red, black, green
	rainbow: 3,

}

/**
 * @callback callback
 * @param {object} c color
 * @param {string} c.hex A hexadecimal color is specified with: #RRGGBB, where the RR (red), GG (green) and BB (blue)
 * hexadecimal integers specify the components of the color. All values must be between 00 and FF.
 * Example #00ff00
 * @param {number} c.r red of RGB color value. Must be between 0 and 255.
 * @param {number} c.g green of RGB color value. Must be between 0 and 255.
 * @param {number} c.b blue of RGB color value. Must be between 0 and 255.
 * @param {number} percent position of the mouse pointer in the percents. See details in options.direction param
 */

/**
 * @callback onError
 * @param {string} message error message
 */

/**
 * creates an instance of ColorPicker
 * @param {string|HTMLElement} elSliderWrapper id of the ColorPicker element or ColorPicker element
 * @param {object} [options] followed options is availablee
 * @param {number|object[]} [options.palette] Palette index or palette array. The following indexes are available:
 * 0 - blue, green, red, white palette.
 * Default is 0 index
 * Example of palette array:
 * @param {object} [options.orientation] orientation of the element. Available "horizontal" or "vertical" orientation
 * @param {object} [options.direction] true - position of the mouse pointer relative left side for 'horizontal' slider
 * or bottom side for 'vertical' slider in the percents.
 * false - position of the mouse pointer relative right side for 'horizontal' slider
 * or relative top side for 'vertical' slider in the percents.
 * Default is true.
 * @param {object} [options.style] style statements
 * @param {object} [options.style.width] width of the element. Default is 200px for options.orientation = "horizontal"
 * and 30px for options.orientation = "vertical".
 * @param {object} [options.style.height] height of the element. Default is 30px for options.orientation = "horizontal"
 * and 200px for options.orientation = "vertical".
 * @param {string} [options.style.border] elSliderWrapper border. Example: '1px solid black'
 * @param {object} [options.sliderIndicator] adds a slider-indicator element for choose by mouse a color from palette.
 * Default is undefuned
 * @param {callback} [options.sliderIndicator.callback] Called whenever the color is changed provided chosen color in RGB HEX format.
 * @param {number} [options.sliderIndicator.value] Initial position of the slider indicator in percent. Default is 0.
 * @param {onError} [options.onError] Called whenever an error has occurred. Default is undefined.
 */
export function create( elSliderWrapper, options ) {

	options = options || {};
	options.orientation = options.orientation || 'horizontal';

	function isHorizontal() { return options.orientation === "horizontal"; }

	if ( options.direction === undefined  )
		options.direction = true;
	options.style = options.style || {};
	//		options.style.width = options.style.width || ( isHorizontal() ? '200px' : '30px' );
	options.style.width = options.style.width || ( isHorizontal() ? 200 : 30 );
	options.style.height = options.style.height || ( isHorizontal() ? 30 : 200 );

	options.onError = options.onError || function () {}

	if ( elSliderWrapper instanceof HTMLElement !== true ) {

		if ( typeof elSliderWrapper !== "string" ) {

			console.error( 'ColorPicker.create: invalid elSliderWrapper = ' + elSliderWrapper );
			return;

		}
		elSliderWrapper = document.getElementById( elSliderWrapper );
		if ( elSliderWrapper === null ) {

			console.error( 'ColorPicker.create: invalid elSliderWrapper = ' + elSliderWrapper );
			return;

		}

	}
	elSliderWrapper.classList.add( 'slider-wrapper' );
	for ( var style in options.style ) {

		elSliderWrapper.style[style] = options.style[style];

	}

//	var slideElement = elSliderWrapper;

	/**
	 * Create SVG element.
	 */
	function CreateSVGElement( el, attrs, children ) {

		//			console.warn( 'CreateSVGElement ' + el );
		el = document.createElementNS( svgNS, el );
		for ( var key in attrs )
			el.setAttribute( key, attrs[key] );
		if ( Object.prototype.toString.call( children ) != '[object Array]' ) children = [children];
		var i = 0, len = ( children[0] && children.length ) || 0;
		for ( ; i < len; i++ )
			el.appendChild( children[i] );
		return el;
	}

	function Palette() {

		function paletteitem( percent, r, g, b ) {

			return {

				percent: percent,
				r: r,
				g: g,
				b: b,

			}

		}
		if ( options.palette === undefined)
			options.palette = paletteIndexes.BGRW;
		var arrayPalette = [

			new paletteitem( 0, 0x00, 0x00, 0xFF ),//blue
			new paletteitem( 33, 0x00, 0xFF, 0x00 ),//green
			new paletteitem( 66, 0xFF, 0xFF, 0x00 ),//red
			new paletteitem( 100, 0xFF, 0xFF, 0xFF ),//white

		];
		switch ( typeof options.palette ) {

			case 'number':
				switch ( options.palette ) {

					case paletteIndexes.BGRW:
						break;//default palette
					case paletteIndexes.monochrome:
						var arrayPalette = [

							new paletteitem( 0, 0x00, 0x00, 0x00 ),//blach
							//new paletteitem( 10, 0x80, 0x80, 0x80 ),//gray
							new paletteitem( 100, 0xFF, 0xFF, 0xFF ),//white

						];
						break;
					case paletteIndexes.bidirectional:
						var arrayPalette = [

							new paletteitem( 0, 0xff, 0x00, 0x00 ),//red
							new paletteitem( 50, 0x00, 0x00, 0xFF ),//black
							new paletteitem( 100, 0x00, 0xFF, 0x00 ),//green

						];
						break;
					case paletteIndexes.rainbow:
						var arrayPalette = [

							/*
													new paletteitem(   0, 0xff, 0x00, 0x00 ),//red
													new paletteitem(  50, 0x00, 0xff, 0x00 ),//green
													new paletteitem( 100, 0x00, 0x00, 0xff ),//blue
							*/
							new paletteitem( 0, 0xff, 0x32, 0x32 ),
							new paletteitem( 16, 0xfc, 0xf5, 0x28 ),
							new paletteitem( 32, 0x28, 0xfc, 0x28 ),
							new paletteitem( 50, 0x28, 0xfc, 0xf8 ),
							new paletteitem( 66, 0x27, 0x2e, 0xf9 ),
							new paletteitem( 82, 0xff, 0x28, 0xfb ),
							new paletteitem( 100, 0xff, 0x32, 0x32 ),

						];
						break;
					default: console.error( 'ColorPicker.create.Palette: invalid options.palette = ' + options.palette );

				}
				break;
			case "object":
				if ( Array.isArray( options.palette ) ) {

					//Custom palette
					arrayPalette = options.palette;
					break;

				}
			default:
				var message = 'invalid options.palette = ' + options.palette;
				console.error( 'ColorPicker.create.Palette: ' + message );
				options.onError( message );

		}
		this.getPalette = function () {

			var palette = [];
			arrayPalette.forEach( function ( item ) {

				palette.unshift( CreateSVGElement( 'stop', {

					offset: ( 100 - item.percent ) + '%', 'stop-color': '#'
						//Thanks to https://stackoverflow.com/a/13240395/5175935
						+ ( "0" + ( Number( item.r ).toString( 16 ) ) ).slice( -2 ).toUpperCase()
						+ ( "0" + ( Number( item.g ).toString( 16 ) ) ).slice( -2 ).toUpperCase()
						+ ( "0" + ( Number( item.b ).toString( 16 ) ) ).slice( -2 ).toUpperCase(),
					'stop-opacity': '1'

				} ) );

			} );
			return palette;

		}
		this.hsv2rgb = function ( stringPercent ) {

			var percent = parseFloat( stringPercent );
			//console.warn( 'percent = ' + stringPercent );
			if ( percent < 0 ) {

				console.error( 'Palette.hsv2rgb: invalid percent = ' + stringPercent );
//				percent = 0;

			}
			else if ( percent > 100 ) {

				console.error( 'Palette.hsv2rgb: invalid percent = ' + stringPercent );
//				percent = 100;

			}
			var lastPalette = arrayPalette[arrayPalette.length - 1];
			if ( lastPalette.percent !== 100 ) {

				//not compatible with Safari for Windows
				//var lastItem = Object.assign( {}, arrayPalette[arrayPalette.length - 1] );

				var lastItem = {};
				Object.keys( lastPalette ).forEach( function ( key ) {

					lastItem[key] = lastPalette[key];

				} );
				lastItem.percent = 100;
				arrayPalette.push( lastItem );

			}
			var itemPrev;
			for ( var i = 0; i < arrayPalette.length; i++ ) {

				var item = arrayPalette[i];
				if ( itemPrev === undefined )
					itemPrev = item;
/*
				var item = Object.assign( {}, arrayPalette[i] );//arrayPalette[i];
				if ( itemPrev === undefined )
					itemPrev = Object.assign( {}, item );//itemPrev = item;
				if ( arrayPalette.length === ( i + 1 ) )
					item.percent = 100;
*/
				if ( ( ( percent >= itemPrev.percent ) && ( percent <= item.percent ) ) ) {

					function color( percentPrev, prev, percentItem, item ) {

						var percentD = percentItem - percentPrev;
						if ( percentD === 0 )
							return prev;
						return Math.round( prev + ( ( item - prev ) / percentD ) * ( percent - percentPrev ) );

					}
					var r = color( itemPrev.percent, itemPrev.r, item.percent, item.r ),
						g = color( itemPrev.percent, itemPrev.g, item.percent, item.g ),
						b = color( itemPrev.percent, itemPrev.b, item.percent, item.b );
					return {

						r: r,
						g: g,
						b: b,
						hex: "#" + ( 16777216 | b | ( g << 8 ) | ( r << 16 ) ).toString( 16 ).slice( 1 ),
						percent: percent

					};

				}
				itemPrev = item;

			}
			var message = 'Invalid color value of the ColorPicker: ' + stringPercent;
			console.error( 'ColorPicker.Palette.hsv2rgb: ' + message );
			options.onError( message );

		}

	}
	var palette = new Palette();
	var slide;
	function getSlideHeight() {

		if ( typeof options.style.height === "string" )
			return parseInt( options.style.height );
		return options.style.height;
//		return slide.querySelector( 'rect' ).height.baseVal.value;

	}
	function getSlideWidth() {

		if ( typeof options.style.width === "string" )
			return parseInt( options.style.width );
		return options.style.width;

		//это не работает когда хочу установить начальное положение ползунка во врем€ создани€ ColorPicker
		//потому что к этому времени ширина ColorPicker еще не вычислена.
		//ѕричем во врем€ отладки, когда ставлю стоп, ширина уже успевает вычисл€тьс€ и все работает.
//		return slide.querySelector( 'rect' ).width.baseVal.value;

	}
	/**
	 * sets color from palette
	 * @param {number} value coordinate of color from palette in percent
	 * @param {number} position coordinate of color from palette
	 */
	function setValue( value, position ) {

		//ќтдельно отправл€ю value и position потому что тер€етс€ точность при обратном преобразовании€ из value в position 
		//дл€ перемещени€ slideIndicator

		if ( slideIndicator === undefined ) {

			console.error( 'Set value of this instance of the ColorPicker is impossible because options.sliderIndicator is not defined.' );
			return;

		}
		var c = palette.hsv2rgb( value );
		if ( c === undefined ) {

			console.error( 'ColorPicker.setValue: invalud c = ' + c );
			return;

		}

		value = c.percent;
		if ( position === undefined )
			position = isHorizontal() ?
				( getSlideWidth() * value ) / 100 :
				getSlideHeight() - ( getSlideHeight() * ( options.direction ? value : 100 - value ) ) / 100;
//console.warn( 'value = ' + value + ' position = ' + position );
		positionIndicators( position );
		if ( options.sliderIndicator.callback !== undefined ) {

			//console.warn( 'callback: ' + c.percent + ' percent c.hex = ' + c.hex );
			options.sliderIndicator.callback( c );

		}

	}

	var slideIndicator;
	if ( options.sliderIndicator !== undefined ) {

		slideIndicator = document.createElement( 'div' );
		slideIndicator.className = 'slider-indicator';
		if ( isHorizontal() )
			slideIndicator.style.width = '10px';
		else slideIndicator.style.height = '10px';
		elSliderWrapper.appendChild( slideIndicator );
		slideIndicator.style.pointerEvents = 'none';

	}

	/**
	 * Helper to position indicators.
	 * @param {number} position Coordinates of the mouse cursor in the slide area.
	 */
	function positionIndicators( position ) {

//console.warn( 'position = ' + position + ' slideIndicator = ' + slideIndicator );
		if ( slideIndicator === undefined )
			return;

		if ( isHorizontal() ) {

//console.warn( 'position = ' + position );
			if ( ( position < 0 ) || ( position > getSlideWidth() ) ) {

				console.error( 'ColorPicker.positionIndicators: Invalid position = ' + position );
				return;

			}
			slideIndicator.style.top = '0px';
			slideIndicator.style.left = ( ( options.direction ? position : getSlideWidth() - position ) - slideIndicator.offsetWidth / 2 ) + 'px';

		} else {

//console.warn( 'position = ' + position );
			if ( ( position < 0 ) || ( position > getSlideHeight() ) ) {

				console.error( 'ColorPicker.positionIndicators: Invalid position = ' + position );
				return;

			}
			slideIndicator.style.left = '0px';
			slideIndicator.style.top = ( position - slideIndicator.offsetHeight / 2 ) + 'px';

		}

	};

	if ( type == 'SVG' ) {

		try {

			var linearGradient = 'linearGradient';
			slide = CreateSVGElement( 'svg', {
				xmlns: 'http://www.w3.org/2000/svg',
				version: '1.1',
				width: options.style.width,
				height: options.style.height,
			},
				[
					CreateSVGElement( 'defs', {},
						CreateSVGElement( linearGradient, {

							id: 'gradient-hsv-' + uniqID,
							x1: isHorizontal() && options.direction ? '100%' : '0%',
							y1: !isHorizontal() && !options.direction ? '100%' : '0%',
							x2: isHorizontal() && !options.direction ? '100%' : '0%',
							y2: !isHorizontal() && options.direction ? '100%' : '0%',

						},
							palette.getPalette()
						)
					),
					CreateSVGElement( 'rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv-' + uniqID + ')' } )
				]
			);
			if ( slideIndicator !== undefined ) {

				slide.style.cursor = isHorizontal() ? 'e-resize' : 's-resize';
				slideIndicator.style.cursor = slide.style.cursor;

			}
		} catch ( e ) {

			//I can not get 
			// slide.querySelector( linearGradient );
			//in Safari 5.1.7 browser for Windows
			//Instead I see the error message:
			// 'null' is not an object( evaluating 'hsvGradient.id = 'gradient - hsv - ' + uniqID' )
			console.error( 'Create SVG element failed! ' + e.message );

		}

//		slideElement.appendChild( slide );
		elSliderWrapper.appendChild( slide );
		elSliderWrapper.style.height = getSlideHeight() + 'px'; 

		if ( slideIndicator !== undefined ) {

			if ( isHorizontal() )
				slideIndicator.style.height = ( parseInt( options.style.height ) - 2 ) + 'px';
			else slideIndicator.style.width = ( parseInt( options.style.width ) - 2 ) + 'px';

			options.sliderIndicator.value = options.sliderIndicator.value || 0;
			setValue( options.sliderIndicator.value );

		}
		uniqID++;

	} else {

		console.error( 'Under constraction' );
/*
			this.slideElement.innerHTML = slide;
*/
	}

	function mouseMove( mouse ) {

		//for IE
		mouse.x = parseInt( mouse.x );
		mouse.y = parseInt( mouse.y );

		var position, size, value;
		if ( isHorizontal() ) {

			position = mouse.x;
			size = getSlideWidth() - 1;

			//¬ Chrome, Opera максимальное значение mouse.x равно ширине Slide
			//¬ IE, Edge, Firefox и Safari for Windows максимальное значение mouse.x равно ширине Slide минус 1
			//ƒумаю  в IE максисальное значение верно, потому что минимальное значение равно нулю.
			//ѕоэтому в Chrome максимальное значение mouse.x уменьшаю на 1
			if ( position >= getSlideWidth() )
				position = size;
			value = ( position * 100 ) / size;
			if ( !options.direction ) {

				value = 100 - value;
				position = size - position;

			}

		} else {

			position = mouse.y;
			size = getSlideHeight() - 1;

			//¬ Chrome, Opera, Firefox максимальное значение mouse.y равно высоте Slide
			//¬ IE, Edge Safari for Windows максимальное значение mouse.y равно высоте Slide минус 1
			//ƒумаю  в IE максисальное значение верно, потому что минимальное значение равно нулю.
			//ѕоэтому в Chrome максимальное значение mouse.y уменьшаю на 1
			if ( position >= getSlideHeight() )
				position = size;
			value = ( 1 - position / size ) * 100;
			if ( !options.direction ) {

				value = 100 - value;

			}

		}
		//ќтдельно отправл€ю value и position потому что тер€етс€ точность при обратном преобразовании€ из value в position 
		//дл€ перемещени€ slideIndicator
		setValue( value, position );

	}
	if ( slideIndicator !== undefined ) {

		var mouseout = false;

		/**
		 * Return click event handler for the slider.
		 * Sets picker background color and calls options.sliderIndicator.callback if provided.
		 */
		function slideListener() {

			return function ( evt ) {

				if ( mouseout )
					return;

				evt = evt || window.event;

				/**
				 * Return mouse position relative to the element el.
				 */
				function mousePosition( evt ) {
					// IE:
					if ( window.event && window.event.contentOverflow !== undefined ) {
//console.warn( 'mousePosition: IE: window.event.offsetX = ' + window.event.offsetX + ' window.event.offsetY = ' + window.event.offsetY );
						return { x: window.event.offsetX, y: window.event.offsetY };
					}
					// Webkit:
					if ( evt.offsetX !== undefined && evt.offsetY !== undefined ) {
//console.warn( 'mousePosition: Webkit: evt.offsetX = ' + evt.offsetX + ' evt.offsetY = ' + evt.offsetY );
						return { x: evt.offsetX, y: evt.offsetY };
					}
					// Firefox:
					var wrapper = evt.target.parentNode.parentNode;
//console.warn( 'mousePosition: Firefox: evt.layerX - wrapper.offsetLeft = ' + ( evt.layerX - wrapper.offsetLeft ) + ' evt.layerY - wrapper.offsetTop = ' + ( evt.layerY - wrapper.offsetTop ) );
					return { x: evt.layerX - wrapper.offsetLeft, y: evt.layerY - wrapper.offsetTop };
				}

console.warn( 'evt.offsetX = ' + evt.offsetX + ' evt.offsetY = ' + evt.offsetY );
				mouseMove( mousePosition( evt ) );

			}
		};

		function addEventListener( element, event, listener ) {

			if ( element === null )
				return;

			if ( element.attachEvent ) {

				element.attachEvent( 'on' + event, listener );

			} else if ( element.addEventListener ) {

				element.addEventListener( event, listener, false );
			}
		}

		addEventListener( slide, 'click', slideListener() );

		/**
		 * @callback listener
		*/

		/**
		 * Enable drag&drop color selection.
		 * @param {object} ctx ColorPicker instance.
		 * @param {listener} listener Function that will be called whenever mouse is dragged over the element with event object as argument.
		 */
		function enableDragging( ctx, listener ) {

			var element = slide;

			//Touchscreen support

			addEventListener( element, 'touchstart', function ( evt ) {

//console.warn( 'ColorPicker.create.enableDragging: touchstart event' );

			} );
			addEventListener( element, 'touchmove', function ( evt ) {

				//≈сли убрать эту функци€ю то во врем€ движени€ пальца по ColorPicker одновременно со slideIndicator будет
				//произходить скроллинг экрана если страница не помещаетс€ на экране
				evt.preventDefault();

				var rect = evt.srcElement.getBoundingClientRect(),
					x = ( evt.touches[0].clientX - rect.left ),
					y = ( evt.touches[0].clientY - rect.top );
				if ( x < 0 ) x = 0;
				if ( y < 0 ) y = 0;
//console.warn( 'ColorPicker.create.enableDragging: touchmove event. x = ' + x + ' y = ' + y );
				mouseMove( { x: x, y: y } );

			} );
			addEventListener( element, 'touchend', function ( evt ) {

//console.warn( 'ColorPicker.create.enableDragging: touchend event' );

			} );

			//mouse support
			addEventListener( element, 'mousedown', function ( evt ) {

				var mouseup = 'mouseup', mousemove = 'mousemove';
				function onMouseUp() {

					//console.warn( mouseup );
					function removeEventListener( element, event, listener ) {

						if ( element === null )
							return;

						if ( element.detachEvent ) {

							element.detachEvent( 'on' + event, listener );

						} else if ( element.removeEventListener ) {

							element.removeEventListener( event, listener, false );

						}
					}
					removeEventListener( window, mouseup, onMouseUp );
					removeEventListener( window, mousemove, listener );

				}
				addEventListener( window, mouseup, onMouseUp );
				addEventListener( window, mousemove, listener );

			} );
			addEventListener( element, 'mouseout', function ( evt ) { mouseout = true; } );
			addEventListener( element, 'mouseover', function ( evt ) { mouseout = false; } );
		}
		enableDragging( this, slideListener() );

	}

	return {

		setValue: setValue,

	};
}
