# suggest

Search suggestion.

- `suggest` doesn't care about ajax requests which you should 

## Installation

```bash
cortex install suggest --save
```

## Usage

### aaa

```js
var suggest = require('suggest');
var s = suggest(input)
	.on('select', function(e){
		console.log(e.data);
	});

```


## Programmatical APIs

### suggest(input, options)

Returns a new `suggest.Suggest` instance.

#### Class: suggest.Suggest(input, options)

- input `DOMElement` Suggest input
- options `Object` Suggest options
	- panel `(Selector|DOMElement)=` The panel which contains suggestion results. If not specified, `suggest` will create a panel for you.
	- itemSelector `Selector` The CSS selector to find result items.
	- itemWrapper `Selector|DOMElement` The `DOMElement` or CSS selector to wrap
	- itemRenderer `function(data)`
	- itemActiveClass `string` 
	- panelContainer `(Selector|DOMElement)=`
	
#### .render(keyword, results)

#### Event: preselect

- data `Object`
	- data: `Object`
	- index: `number`
	- keyword: `string`
	- element: `DOMElement`

#### Event: select

- data `Object` The same as `preselect` event.
	
This event is emitted when user press enter on the selected item or after executing method `.select()`
	
#### Event: render

This event is emitted after executing method `.show()`.

#### Event: show

Emitted after executing method `.show()`.

#### Event: hide

Emitted after executing method `.hide()`.
