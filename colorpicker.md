# ColorPicker.

Pure JavaScript color picker.

[Example of using](https://raw.githack.com/anhr/ColorPicker/master/Example/index.html).
[Module version](https://raw.githack.com/anhr/ColorPicker/master/Example/modular.html).

## Packaged Builds
The easiest way to use ColorPicker in your code is by using the built source at `build/colorpicker.js`.
These built JavaScript files bundle all the necessary dependencies to run ColorPicker.

In your `head` tag, include the following code:
```
<script src="https://raw.githack.com/anhr/ColorPicker/master/build/colorpicker.js"></script>
```
or
```
<script src="https://raw.githack.com/anhr/ColorPicker/master/build/colorpicker.min.js"></script>
```
or if your browser support modular JavaScript code, in your `script type="module"` tag, include the following code:
```
import ColorPicker from './colorpicker.js';
```

In your `body` tag, include the following code:
```
<div id="colorpicker"></div>
```

Now you can use window.ColorPicker for select a color from picker.

### ColorPicker.create( elSliderWrapper, options )

Creates an instance of ColorPicker.

elSliderWrapper: id of the ColorPicker element or ColorPicker element.

options: See details in the `function create( elSliderWrapper, options )` in the [index.js](https://github.com/anhr/colorPicker/blob/master/index.js) file.

#### Example of the simple ColorPicker
```
ColorPicker.create( document.getElementById( "colorpicker" ) );
```
#### Example of the event if user changed color..
```
ColorPicker.create( "colorpicker", {

	sliderIndicator: {
		callback: function ( c ) {

			console.log( 'callback: ' + c.percent + ' percent c.hex = ' + c.hex );

		}
	},

} );
```
## Directory Contents

```
└── build - Compiled source code.
```

## Building your own ColorPicker

In the terminal, enter the following:

```
$ npm install
$ npm run build
```
