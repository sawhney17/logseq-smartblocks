import '@logseq/libs'
import {
  BlockEntity,
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';

import { parseDynamically } from './parser';

import { renderApp, valueArray } from './index';
export var networkRequest = false
export var stopStatus = true
export function editNetworkRequest(value) {
  networkRequest = value
}

export var data = null
// const reg = /<%([^%].*?)%>/g
const reg = /<%(.*?)%>/g
export var blockUuid2
export var sibling
var currentRun = 1
var previousRun = 0
async function triggerParse(obj) {
  if (obj.content) {
    let regexMatched = obj.content.match(reg)
    for (const x in regexMatched) {
      let toBeParsed = obj.content
      var currentMatch = regexMatched[x]
      let formattedMatch = await parseDynamically(currentMatch);
      let newRegexString = toBeParsed.replace(currentMatch, formattedMatch)
      obj.content = newRegexString
      obj.properties = {}
    }
  }
  currentRun += 1
  await obj.children.map(triggerParse)
}

export function triggerParseInitially(obj) {
  console.log(obj)
  if (obj.content) {
    
    let regexMatched = obj.content.match(reg)
    // delete obj.uuid
    // delete obj.id
    // delete obj.left
    // delete obj.parent
    // delete obj.pathRefs
    for (const x in regexMatched) {
      var currentMatch = regexMatched[x]
      if (currentMatch.toLowerCase().includes("setinput:")) {
        const inputs = currentMatch.slice(2, -2).split(":")
        const variableName = inputs[1]
        const variableOptions = inputs[2]?.split(",")
        variableOptions ? valueArray.push({ value: "", name: variableName, options: variableOptions }) : valueArray.push({ value: "", name: variableName })
      }
    }
  }
  obj.children.map(triggerParseInitially)
}

export async function insertProperlyTemplatedBlock(blockUuid3, template2, sibling3) {
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
    if (results && results.length > 0) {
      refUUID = results[0].uuid
      console.log(refUUID)
      console.log(results)
      let origBlock = await logseq.Editor.getBlock(refUUID, {
        includeChildren: true,
      })
      data = origBlock
      console.log("origBlock")
      console.log(origBlock)
      triggerParseInitially(origBlock)
      if (valueArray.length > 0) {
        renderApp()
        logseq.showMainUI()
      }
      else {
        logseq.hideMainUI({ restoreEditingCursor: true });
        insertProperlyTemplatedBlock2(blockUuid3, sibling3, origBlock)
      }

    }
  } catch (error) {
  }
}
export async function insertProperlyTemplatedBlock2(blockUuid, sibling2, origBlock) {
  data = origBlock
  async function insertFinally() {
    let page = await logseq.Editor.getPage(blockUuid)
    if (page != undefined) {
      console.log(
        "iserting"
      )
      let blockTree = (await logseq.Editor.getPageBlocksTree(blockUuid))
      let lastBlock = blockTree[blockTree.length - 1]
      logseq.Editor.insertBatchBlock(lastBlock.uuid, data.children as unknown as IBatchBlock, { sibling: true })
    }
    else {
      logseq.Editor.insertBatchBlock(blockUuid, data.children as unknown as IBatchBlock, { sibling: (sibling2 === 'true') })
    }

  }

  triggerParse(data)
  timeOutShouldBeSet()
  function checkDiff() {

    if (currentRun != previousRun) {
      previousRun = currentRun
      timeOutShouldBeSet()
    }
    else {
      if (networkRequest == true) {
        setTimeout(function () {
          checkDiff()
          networkRequest = false
        }, 500);
      }
      else {
        logseq.App.showMsg("Run has begun")
        insertFinally()
      }
    }
  }
  function timeOutShouldBeSet() {
    setTimeout(function () {
      checkDiff()
    }, 100);
  }
  if (origBlock.children.length === 0 || !origBlock.children) {
    logseq.App.showMsg("Whoops! Doesn't look like there's any content under the template.");
  }
}
  // }
  // catch (err) {
  //     console.log(err)
  //   }
  // }