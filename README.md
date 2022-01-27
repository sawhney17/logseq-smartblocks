<a href="https://www.buymeacoffee.com/sawhney17" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
# SmartBlocks for Logseq

This plugin allows you to create a templater button, which on click, inserts the contents of the template you've specified, under the block. Allows for advanced features and workflows. 

Currently porting features from the official Smartblocks from Roam plugin. Feel free to ping me on twitter [@aryansawhney17](https://twitter.com/aryansawhney17), or file a github issue for any feedback or feature requests. 


# Features

## Template Inserter
### Setup
1. Use the slash menu and type `Create templater block`
2. After the first comma, type the name of the template(Make sure you keep the correct capitalization and spacing)
3. (Optional) After the second comma, type the name you'd like to show up on the rendered button

![Screen Recording 2022-01-16 at 5 19 50 PM](https://user-images.githubusercontent.com/80150109/149662207-c95a285a-fe4c-4e9f-b4d4-b2154330eebd.gif)

### Usage in action
![Screen Recording 2022-01-16 at 5 19 50 PM](https://user-images.githubusercontent.com/80150109/149662222-79f0fa35-c2d8-4070-93d9-a39b0b7b4982.gif)
### Flags
- You can configure the templater in the following ways
	1. Set template(required)
	2. Set title(required)
	3. Set sibling true or false(required)
- Basic structure of the plugin is as such 
	- `{{renderer :smartblock, journalTemplate, New Journal, false}}`
### Using NLP
1. In the templates, wherever you want a dynamic date, one that shows a different value based on the date it was inserted, use this syntax `<%NLP Input%>`
	- `<%Today%>`
	- `<%Last monday%>`
	- `<%current time%>` 
	- `<%30th of december%>` 
2. Automatically respects your date settings
	- Your format will automatically generate a specific date 
3. Support Aliases
	- `[tomorrow](<%tomorrow%>)` in the template generates `[tomorrow]([[Jan 19th, 2022]])`
![Screen Recording 2022-01-18 at 12 36 29 PM](https://user-images.githubusercontent.com/80150109/149903174-1187c911-76c3-44be-87dc-a35e5fb37d5a.gif)
### Using if statements with dates
1. If you want an item in a template to only show up on a certain day of the week 
2. Follow the below syntax
	- if the day of the week is monday
		- `<%if dayofweek = 1%>`
	- if it's the 22th
		- `<%if dayofmonth = 22%>`
	- if it's the 100th day of the year
		- `<%if dayofyear = 100%>`
	- if it's July
		- `<%month%> = 7`
### Using the Random Function
- Limited scope at the moment, can currently fetch a random block linking to a page and create a reference to the random block
- Use `<randomblock Name of page/tag>`
	-`<randomblock twitter>`
	-`<randomblock Tasks Inbox>`
### Limitations
- Only works with dynamic variables up to 4 blocks deep 

### TODO
- [x] Enable support for natural language processing for dates allowing for dynamic dates (different date auto added based on current date)
- [ ] Allow NLP dates in if statements

## Property Renderer
Has been shifted to it's own plugin: https://github.com/sawhney17/logseq-property-visualizer

# Credits 
> If you like the work I'm doing, consider [buying me a coffee](https://www.buymeacoffee.com/sawhney17) :)
- [Sherlockjs](https://github.com/neilgupta/Sherlock)
- Thanks a ton to [hkgnp](https://github.com/hkgnp)and his [NLP plugin](https://github.com/hkgnp/logseq-datenlp-plugin) for implementation inspiration
- Credits to the original SmartBlocks plugin for Roam by [@tfthacker](https://twitter.com/tfthacker)
