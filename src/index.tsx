import '@logseq/libs'
import {
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';
import Sherlock from 'sherlockjs';
import {getDateForPage } from 'logseq-dateutils';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { handleClosePopup } from './handleClosePopup';

/**
* main entry
*/


async function main () {
  async function parseRandomly(pageName:string){
    pageName.toLowerCase()
    let query = `[:find (pull ?b [*])
    :where
    [?b :block/path-refs [:block/name "${pageName.toLowerCase()}"]]]`
    
    let results = await logseq.DB.datascriptQuery(query)
    let flattenedResults = results.map((mappedQuery) => ({
      uuid: mappedQuery[0].uuid['$uuid$'],
    }))
    let index = Math.floor(Math.random()*flattenedResults.length)
    return `((${flattenedResults[index].uuid}))`
  }
  function parseConditional(condition:string, value){
    switch (condition){
        case "dayofweek":
        if(new Date().getDay() == value){
            return ""
        }
        else if (new Date().getDay() == 0 && value == 7){
            return ""
        }
        else{
            return "Error"
        }
        case "dayofmonth":
        if(new Date().getDate() == value){
            return ""
        }
        else{
            return "Error"
        }
        case "month":
        if(new Date().getMonth() == value){
            return ""
        }
        else{
            return "Error"
        }
        case "dayofyear":
        if(new Date().getDate() == value){
            return ""
        }
        else{
            return "Error"
        }
        default:
        return "Error"
    }
}
  async function parseDynamically(blockContent){
    const userConfigs = await logseq.App.getUserConfigs();
    const preferredDateFormat = userConfigs.preferredDateFormat;
    let ifParsing = /(i+f)/
    let randomParsing = /randomblock/
    if(blockContent.match(ifParsing)){
    let parsedInput = blockContent.slice(2, -2); 
    let spaceParsedInput = parsedInput.replace(/\s+/g, '');
    let input2 = spaceParsedInput.split("if")
    let input3 = input2[1].split("=")
    return parseConditional(input3[0], input3[1])
    }
    if(blockContent.match(randomParsing)){
      let parsedInput = blockContent.slice(2, -2);
      // let spaceParsedInput = parsedInput.replace(/\s+/g, '');
      let input2 = parsedInput.split("randomblock")
      let input3 = input2[1].replace(" ", '');
      return await parseRandomly(input3)
    }
  // Implement time parsing
  if (blockContent.toLowerCase() == "<%currentTime%>" || blockContent.toLowerCase() =="<%time%>" || blockContent.toLowerCase() == "<%current time%>"){
        let currentTime = new Date()
        let formattedTime
        if (currentTime.getMinutes() <10){
          formattedTime = currentTime.getHours() + ":" + "0"+(currentTime.getMinutes())
        }
        else{formattedTime = currentTime.getHours() + ":" + (currentTime.getMinutes())}
        return(formattedTime)
  }
  // Implement if parsing
  const parsedBlock = await Sherlock.parse(blockContent);
  // Destructure
  const { isAllDay, eventTitle, startDate, endDate } = parsedBlock;
  if (startDate == null){
    return blockContent
  }
  return(getDateForPage(startDate, preferredDateFormat))

  }
  async function insertProperlyTemplatedBlock (blockUuid, template, sibling) {
    let reg = /<%([^%].*?)%>/g
    var query = `
    [:find (pull ?b [*])
   :where
   [?b :block/properties ?p]
   [(get ?p :template) ?ty]
   [(= "${template}" ?ty)]]`

    let refUUID
    try {
      let ret = await logseq.DB.datascriptQuery(query)
      const results = ret?.flat()
      if(results && results.length > 0) {
        refUUID = results[0].uuid.$uuid$
        const origBlock = await logseq.Editor.getBlock(refUUID, {
          includeChildren: true,
        });
        if (origBlock.children.length === 0 || !origBlock.children) {
              logseq.App.showMsg("Whoops! Doesn't look like there's any content under the template.");
            } else {
              const childBlocksArr = origBlock.children as unknown as IBatchBlock
              const missingKeys = [[]]
              for (const constant2 in childBlocksArr){ //First child block
                for (const constant3 in childBlocksArr[constant2]["children"]){ //Second child block
                  for (const constant4 in childBlocksArr[constant2]["children"][constant3]["children"]){ // parsing third child blcok 
                    let initiallyParsed = childBlocksArr[constant2]["children"][constant3]["children"][constant4]["content"]
                    let regexMatched = initiallyParsed.match(reg)
                    for (const x in regexMatched){
                      let toBeParsed = childBlocksArr[constant2]["children"][constant3]["children"][constant4]["content"]
                      var currentMatch = regexMatched[x]
                      let formattedMatch = await parseDynamically(currentMatch);
                      
                      if (formattedMatch != "Error"){
                      let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
                      let toBeChanged = newRegexString
                      childBlocksArr[constant2]["children"][constant3]["children"][constant4]["content"] = toBeChanged}
                      
                      else{
                        missingKeys.push([constant2, constant3, constant4])
                      }
                    } 
                   }
                  let initiallyParsed = childBlocksArr[constant2]["children"][constant3]["content"]
                  let regexMatched = initiallyParsed.match(reg)
                  for (const x in regexMatched){
                    let toBeParsed = childBlocksArr[constant2]["children"][constant3]["content"]
                    var currentMatch = regexMatched[x]
                    let formattedMatch = await parseDynamically(currentMatch);
                    if (formattedMatch != "Error"){
                    let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
                    let toBeChanged = newRegexString
                    childBlocksArr[constant2]["children"][constant3]["content"] = toBeChanged}
                    else{
                      missingKeys.push([constant2, constant3])
                    }
                  
                  }
                    
                }
                    let initiallyParsed = childBlocksArr[constant2]["content"]
                    let regexMatched = initiallyParsed.match(reg)
                    for (const x in regexMatched){
                      let toBeParsed = childBlocksArr[constant2]["content"]
                      var currentMatch = regexMatched[x]

                      let formattedMatch = await parseDynamically(currentMatch);
                      if (formattedMatch != "Error"){
                      let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
                      let toBeChanged = newRegexString
                      childBlocksArr[constant2]["content"] = toBeChanged}
                      else{
                        missingKeys.push([constant2])
                      }
                    }
            }

          for (const key in missingKeys){
            switch (missingKeys[key]["length"]){
              case 3: 
              var constant2 = missingKeys[key][0]
              var constant3 = missingKeys[key][1]
              var constant4 = missingKeys[key][2]
              childBlocksArr[constant2]["children"][constant3]["children"].splice(constant4,1)
              break;
              case 2: 
              var constant2 = missingKeys[key][0]
              var constant3 = missingKeys[key][1]
              childBlocksArr[constant2]["children"].splice(constant3,1)    
              break;
              case 1: 
              var constant2 = missingKeys[key][0]
              childBlocksArr[constant2] = null
              break;
              case 0: 
              break;
              default:
              console.log(`error: keylength is ${missingKeys[key]["length"]}`);
            }
          }
              await logseq.Editor.insertBatchBlock(blockUuid, childBlocksArr, {
                before: false,
                sibling: (sibling.toLowerCase() === 'true')
                ,
              });
          }

    }
  } catch (err) {
      console.log(err)
    }

  }
    logseq.provideModel({
        async insertTemplatedBlock (e: any) {
          const { blockUuid, template, sibling } = e.dataset
            insertProperlyTemplatedBlock(blockUuid, template, sibling)
            
        }
    }),

    logseq.App.registerCommandPalette(
      {
        key: 'logseq-noTODO-plugin',
        label: "Quick todo to today's journal page",
        keybinding: {
          binding: 'm t',
        },
      },
      () => {
        logseq.showMainUI();
  
        document.addEventListener('keydown', (e: any) => {
          if (e.keyCode !== 27) {
            (document.querySelector('.task-field') as HTMLElement).focus();
          }
        });
      }
    );

    logseq.provideStyle(`
    .templater-btn {
       border: 1px solid var(--ls-border-color); 
       white-space: initial; 
       padding: 2px 4px; 
       border-radius: 4px; 
       user-select: none;
       cursor: default;
       display: flex;
       align-content: center;
    }
    
    .templater-btn:hover {
        background-color: #defcf0;
        border-color: #9ddbc7;
        color: #0F9960;
    }
  `)

    // let templaterBlock;

      logseq.Editor.registerSlashCommand('Create Templater Block', async () => {
          await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblock, , }} `);
          // templaterBlock = await logseq.Editor.getCurrentBlock();
        });
      logseq.Editor.registerSlashCommand('Create Inline Templater Block', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblockInline, }} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });
      logseq.Editor.registerSlashCommand('Create Inline Templater Block(guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblockInline, template name}} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });
        
      logseq.Editor.registerSlashCommand('Create Templater Block (guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :smartblock, template name, button title, sibling?}} `);
        // templaterBlock = await logseq.Editor.getCurrentBlock();
      });

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title, sibling] = payload.arguments;
        if (title == undefined){
          title = "New Template"
        }
        let realSiblings;
        if (sibling == "true"){
           realSiblings = true
        }
        else{
           realSiblings = false
        }

        if (type ==':smartblock'){
        logseq.provideUI({
            key: 'SmartBlocks for Logseq',
            reset: true,
            slot,
            template: `
            <button class="templater-btn" data-block-uuid="${payload.uuid}" data-sibling = ${realSiblings} data-template="${template}" data-title="${title}"
            data-on-click="insertTemplatedBlock">${title}</button>
           `,
          });
        }
        if (type ==':smartblockInline'){
          await insertProperlyTemplatedBlock(payload.uuid, template, "true")
          logseq.Editor.removeBlock(payload.uuid)
          }
      });

      handleClosePopup()
      ReactDOM.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
        document.getElementById('app')
      );
}

logseq.ready(main).catch(console.error)