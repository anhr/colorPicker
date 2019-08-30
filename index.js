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
	hueOffset = 15, svgNS = 'http://www.w3.org/2000/svg', uniqID = 0;

/**
* @callback callback
* @param {object} c color
* @param {string} c.hex A hexadecimal color is specified with: #RRGGBB, where the RR (red), GG (green) and BB (blue)
* hexadecimal integers specify the components of the color. All values must be between 00 and FF.
* Example #00ff00
* @param {number} c.r red of RGB color value. Must be between 0 and 255.
* @param {number} c.g green of RGB color value. Must be between 0 and 255.
* @param {number} c.b blue of RGB color value. Must be between 0 and 255.
* @param {number} percent position of the mouse pointer relative left side for 'horizontal' slider
* or bottom side for 'vertical' slider in the percents.
*/

/**
* creates an instance of ColorPicker
* @param {string|HTMLElement} elSliderWrapper id of the ColorPicker element or ColorPicker element
* @param {object} [options] followed options is available
* @param {object} [options.orientation] orientation of the element. Available "horizontal" or "vertical" orientation
* @param {object} [options.style] style statements
* @param {object} [options.style.width] width of the element. Default is 200px for options.orientation = "horizontal"
* and 30px for options.orientation = "vertical".
* @param {object} [options.style.height] height of the element. Default is 30px for options.orientation = "horizontal"
* and 200px for options.orientation = "vertical".
* @param {string} [options.style.border] elSliderWrapper border. Example: '1px solid black'
* @param {object} [options.sliderIndicator] adds a slider-indicator element for choose by mouse a color from palette.
* Default is undefuned
* @param {callback} [options.sliderIndicator.callback] Called whenever the color is changed provided chosen color in RGB HEX format.
*/
export function create( elSliderWrapper, options ) {

	options = options || {};
	options.orientation = options.orientation || 'horizontal';
	options.style = options.style || {};
	//		options.style.width = options.style.width || ( options.orientation === 'horizontal' ? '200px' : '30px' );
	options.style.width = options.style.width || ( options.orientation === 'horizontal' ? 200 : 30 );
	options.style.height = options.style.height || ( options.orientation === 'horizontal' ? 30 : 200 );

	if ( elSliderWrapper instanceof HTMLDivElement !== true ) {

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

	elSliderWrapper.style.width = options.style.width + 'px';
	elSliderWrapper.style.height = options.style.height + 'px';

	/*
	if ( options.style.border !== undefined )
		elSliderWrapper.style.border = options.style.border;
	*/

	var slideElement = document.createElement( 'div' );
	elSliderWrapper.appendChild( slideElement );

	var slideIndicator;
	if ( options.sliderIndicator !== undefined ) {

		slideIndicator = document.createElement( 'div' );
		slideIndicator.className = 'slider-indicator';
		if ( options.orientation === "horizontal" )
			slideIndicator.style.width = '10px';
		else slideIndicator.style.height = '10px';
		elSliderWrapper.appendChild( slideIndicator );
		slideIndicator.style.pointerEvents = 'none';

	}

	/**
	 * Helper to position indicators.
	 * @param {object} mouseSlide Coordinates of the mouse cursor in the slide area.
	 */
	function positionIndicators( mouseSlide ) {

		if ( mouseSlide && ( slideIndicator !== undefined ) ) {

			if ( options.orientation === "horizontal" ) {

				slideIndicator.style.top = '0px';
				slideIndicator.style.left = ( mouseSlide.x - slideIndicator.offsetWidth / 2 ) + 'px';

			} else {

				slideIndicator.style.left = '0px';
				slideIndicator.style.top = ( mouseSlide.y - slideIndicator.offsetHeight / 2 ) + 'px';

			}

		}
	};

	if ( type == 'SVG' ) {

		/**
		 * Create SVG element.
		 */
		function $( el, attrs, children ) {
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
			var arrayPalette = [

				/*
								new paletteitem( 0, 0xFF, 0xFF, 0xFF ),//white
								new paletteitem( 50, 0x00, 0xFF, 0x00 ),//green
								new paletteitem( 100, 0x00, 0x00, 0xFF ),//blue
				*/
				new paletteitem( 0, 0x00, 0x00, 0xFF ),//blue
				new paletteitem( 33, 0x00, 0xFF, 0x00 ),//green
				new paletteitem( 66, 0xFF, 0xFF, 0x00 ),//red
				new paletteitem( 100, 0xFF, 0xFF, 0xFF ),//white

			];
			this.getPalette = function () {

				var palette = [];
				arrayPalette.forEach( function ( item ) {

					palette.unshift( $( 'stop', {

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
			this.hsv2rgb = function ( percent ) {

				//console.warn( 'percent = ' + percent );
				if ( ( percent < 0 ) || ( percent > 100 ) ) {

					//console.error( 'Palette.hsv2rgb: invalid percent = ' + percent );
					return;

				}
				var itemPrev;
				for ( var i = 0; i < arrayPalette.length; i++ ) {

					var item = arrayPalette[i];
					if ( itemPrev === undefined )
						itemPrev = item;
					if ( ( percent >= itemPrev.percent ) && ( percent <= item.percent ) ) {

						function color( percentPrev, prev, percentItem, item ) {

							var percentD = percentItem - percentPrev;
							if ( percentD === 0 )
								return prev;
							return prev + ( ( item - prev ) / percentD ) * ( percent - percentPrev );

						}
						var r = color( itemPrev.percent, itemPrev.r, item.percent, item.r ),
							g = color( itemPrev.percent, itemPrev.g, item.percent, item.g ),
							b = color( itemPrev.percent, itemPrev.b, item.percent, item.b );
						return {

							r: r,
							g: g,
							b: b,
							hex: "#" + ( 16777216 | b | ( g << 8 ) | ( r << 16 ) ).toString( 16 ).slice( 1 ), percent: percent

						};

					}
					itemPrev = item;

				}

			}

		}
		var palette = new Palette();

		var slide = $( 'svg', {
			xmlns: 'http://www.w3.org/2000/svg',
			version: '1.1',
			width: '100%',//options.style.width,
			height: '100%',//options.style.height,
		},
			[
				$( 'defs', {},
					$( 'linearGradient', {

						id: 'gradient-hsv',
						/*
													x1: '100%',
													y1: '0%',
						*/
						x1: options.orientation === "horizontal" ? '100%' : '0%',
						y1: options.orientation === "horizontal" ? '0%' : '100%',
						x2: '0%',
						y2: '0%'

					},
						palette.getPalette()
					)
				),
				$( 'rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#gradient-hsv)' } )
			]
		);
		slide.style.cursor = options.orientation === "horizontal" ? 'e-resize' : 's-resize';
		if ( slideIndicator !== undefined )
			slideIndicator.style.cursor = slide.style.cursor;

		// Generate uniq IDs for linearGradients so that we don't have the same IDs within one document.
		// Then reference those gradients in the associated rectangles.

		var slideClone = slide.cloneNode( true );

		var hsvGradient = slideClone.getElementsByTagName( 'linearGradient' )[0];

		var hsvRect = slideClone.getElementsByTagName( 'rect' )[0];

		hsvGradient.id = 'gradient-hsv-' + uniqID;
		hsvRect.setAttribute( 'fill', 'url(#' + hsvGradient.id + ')' );

		slideElement.appendChild( slideClone );
		//			elSliderWrapper.appendChild( slideClone );

		/*
		 * Это надо использовать если в CSS #slider установить background-image: linear-gradient(to right, red, yellow, blue);
					var elSliderIndicator = this.slideElement.parentElement.querySelector( '#slider-indicator' );
					slideClone.style.height = 2 * elSliderIndicator.clientHeight - elSliderIndicator.offsetHeight + 'px';
		*/
		//			slideClone.style.height = this.slideElement.parentElement.querySelector( '#slider-indicator' ).offsetHeight + 'px';
		//			slideClone.style.height = slideElement.parentElement.querySelector( '.slider-indicator' ).offsetHeight + 'px';
		slideClone.style.height = elSliderWrapper.offsetHeight + 'px';
		//			slideClone.style.height = options.style.height;
		positionIndicators( { x: 0, y: 0 } );
		if ( slideIndicator !== undefined ) {

			if ( options.orientation === "horizontal" )
				slideIndicator.style.height = ( options.style.height - 2 ) + 'px';
			else slideIndicator.style.width = ( options.style.width - 2 ) + 'px';

		}
		uniqID++;

	} else {

		console.error( 'Under constraction' );
		/*
					this.slideElement.innerHTML = slide;
		*/
	}

	if ( slideIndicator !== undefined ) {

		var mouseout = false;

		/**
		 * Return click event handler for the slider.
		 * Sets picker background color and calls options.sliderIndicator.callback if provided.
		 */
		function slideListener( ctx ) {
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
						return { x: window.event.offsetX, y: window.event.offsetY };
					}
					// Webkit:
					if ( evt.offsetX !== undefined && evt.offsetY !== undefined ) {
						return { x: evt.offsetX, y: evt.offsetY };
					}
					// Firefox:
					var wrapper = evt.target.parentNode.parentNode;
					return { x: evt.layerX - wrapper.offsetLeft, y: evt.layerY - wrapper.offsetTop };
				}

				var mouse = mousePosition( evt ), mousePosition = mouse.x;
				//console.warn( 'mousePosition = ' + mousePosition );
				ctx.h = mousePosition / slideElement.offsetWidth * 360;// + hueOffset;

				/**
				 * Convert HSV representation to RGB HEX string.
				 * Credits to http://www.raphaeljs.com
				 */
				function hsv2rgb( hsv ) {

					//						return palette.hsv2rgb( 100 - ( hsv.h * 100 ) / 360 );
					return palette.hsv2rgb( ( hsv.h * 100 ) / 360 );

				}

				var c = hsv2rgb( { h: ctx.h, s: ctx.s, v: ctx.v } );
				//console.warn( 'ctx.h = ' + ctx.h );
				if ( c !== undefined ) {

					//console.warn( 'ctx.h = ' + ctx.h + ' mouse.x = ' + mouse.x + ' percent = ' + c.percent + ' r = ' + c.r + ' g = ' + c.g + ' b = ' + c.b );
					positionIndicators( mouse );
					if ( options.sliderIndicator.callback !== undefined ) {

						//							options.sliderIndicator.callback( c.hex, { h: ctx.h - hueOffset, s: ctx.s, v: ctx.v }, { r: c.r, g: c.g, b: c.b }, mouse );
						options.sliderIndicator.callback( c );

					}

				}
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

		addEventListener( slideElement, 'click', slideListener( this ) );

		/**
		 * @callback listener
		 * @param {obect} ctx
		*/

		/**
		 * Enable drag&drop color selection.
		 * @param {object} ctx ColorPicker instance.
		 * @param {listener} listener Function that will be called whenever mouse is dragged over the element with event object as argument.
		 */
		function enableDragging( ctx, listener ) {

			var element = slideElement;
			addEventListener( element, 'mousedown', function ( evt ) {
				/*
									function onMouseDrag( e ) {
				
										console.warn( 'onMouseDrag' );
										return false;
									}
				*/
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
			/*
							var mousedown = false;
			
							addEventListener( element, 'mousedown', function ( evt ) { mousedown = true; } );
							addEventListener( element, 'mouseup', function ( evt ) { mousedown = false; console.warn( 'mousedown' + mousedown ); } );
			//				addEventListener( element, 'mouseout', function ( evt ) { mousedown = false; } );
							addEventListener( element, 'mousemove', function ( evt ) {
			
								if ( mousedown )
									listener( evt );
			
							} );
			*/
		}
		enableDragging( this, slideListener( this ) );

	}
}

//export default ColorPicker;
