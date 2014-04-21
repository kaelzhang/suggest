# suggest

Search suggestion utilties to manage suggest panels and user events.


## Installation

```bash
cortex install suggest --save
```

## Usage

```js
var suggest = require('suggest');
var s = suggest(input)
	.on('select', function(e){
		console.log('you select:', e.index);
	});
	
s.render(
	// keywords in input field
	'people', 
	
	// data from remote server
	[
		{
    		text: 'people\'s park'
		}, {
    		text: 'people square'
		}
	]
);
```


## Programmatical APIs

### suggest(input, options)

Returns a new `suggest.Suggest` instance.

#### Class: suggest.Suggest(input, options)

- input `DOMElement` Suggest input
- options `Object` Suggest options. All options below are optional.
	- panel `Selector|DOMElement` The panel which contains suggestion results. If not specified, `suggest` will create a panel for you.
	- itemSelector `Selector` The CSS selector to find result items.
	- itemWrapper `Selector|DOMElement` The `DOMElement` or CSS selector to wrap.
	- itemRenderer `function(data)` The factory to render a suggeset item from data. 
	- itemActiveClass `string` The css class name added to the item when the item has been selected. Optional, default to `'suggest-active'`.
	- panelContainer `Selector|DOMElement` The container to append the panel to. If not specified, `suggest` will not append the panel.
	
#### .render(keyword, results)

Renders the items by keywords and search results.

Notice that `suggest` will never care about `results`, you could do it by yourself.


#### Event: preselect

- data `Object`
	- data: `Object`
	- index: `number`
	- keyword: `string`
	- element: `DOMElement`
	
This event is emitted after user presses up or down to activate an item, or when the item is hovered by mouse cursor.

#### Event: select

- data `Object` The same as `preselect` event.
	
This event is emitted when user press enter on the selected item or after executing method `.select()`
	
#### Event: render

This event is emitted after executing method `.show()`.

#### Event: show

Emitted after executing method `.show()`.

#### Event: hide

Emitted after executing method `.hide()`.
