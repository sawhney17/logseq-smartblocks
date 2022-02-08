import '@logseq/libs'
import {
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {parseDynamically} from './parser';

import { valueArray, currentValueArray, currentValueCount, valueCount } from './index';
export var data = null

export var blockUuid2
export var sibling

async function triggerParse(obj){
  let reg = /<%([^%].*?)%>/g
  if (obj.content) {
    let regexMatched = obj.content.match(reg)
      for (const x in regexMatched){
        let toBeParsed = obj.content
        var currentMatch = regexMatched[x]
        let formattedMatch = await parseDynamically(currentMatch);
        let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
        obj.content = newRegexString
    }
     }
    
  await obj.children.map(triggerParse)
}

export function triggerParseInitially(obj){
  let reg = /<%([^%].*?)%>/g
  if (obj.content) {
    let regexMatched = obj.content.match(reg)
      for (const x in regexMatched){
        var currentMatch = regexMatched[x]
        if (currentMatch.toLowerCase().includes("setinput:")){
          valueArray.push({variable: currentMatch.slice(2, -2).split(":")[1], name: ""})
        }
    }
     }
    
  obj.children.map(triggerParseInitially)
}

 export async function insertProperlyTemplatedBlock (blockUuid3, template2, sibling3:boolean, parameters = []){
  var query = `
  [:find (pull ?b [*])
 :where
 [?b :block/properties ?p]
 [(get ?p :template) ?ty]
 [(= "${template2}" ?ty)]]`
blockUuid2 = blockUuid3
sibling = sibling3
  let refUUID
  try {
    let ret = await logseq.DB.datascriptQuery(query)
    const results = ret?.flat()
    
    if(results && results.length > 0) {
      refUUID = results[0].uuid.$uuid$
      const origBlock = await logseq.Editor.getBlock(refUUID, {
        includeChildren: true,
      });
      data = origBlock
triggerParseInitially(data)
if (valueArray.length > 0){
logseq.showMainUI()
}
else{
  insertProperlyTemplatedBlock2(blockUuid3, sibling3, origBlock)
}
    }
  } catch (error) {
    console.log(error)
  }
  
  
}
export async function insertProperlyTemplatedBlock2 (blockUuid, sibling2, origBlock) {
//     var query = `
//     [:find (pull ?b [*])
//    :where
//    [?b :block/properties ?p]
//    [(get ?p :template) ?ty]
//    [(= "${template}" ?ty)]]`
// blockUuid2 = blockUuid
//     let refUUID
// try {
//       let ret = await logseq.DB.datascriptQuery(query)
      // const results = ret?.flat()
      
      // if(results && results.length > 0) {
      //   refUUID = results[0].uuid.$uuid$
      //   const origBlock = await logseq.Editor.getBlock(refUUID, {
      //     includeChildren: true,
      //   });
        data = origBlock
        function insertFinally (){
          logseq.Editor.insertBatchBlock(blockUuid, data.children as unknown as IBatchBlock, {sibling:(sibling2 === 'true')});
        }

          triggerParse(data)
          setTimeout(function(){
            insertFinally()
          }, 100);
        if (origBlock.children.length === 0 || !origBlock.children) {
              logseq.App.showMsg("Whoops! Doesn't look like there's any content under the template.");
            }
    }
  // } 
  // catch (err) {
  //     console.log(err)
  //   }
  // }