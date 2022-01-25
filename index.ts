import '@logseq/libs'
import {
  BlockEntity,
  PageEntity,
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';
import Sherlock from 'sherlockjs';
/**
* main entry
*/



async function main () {
  const userConfigs = await logseq.App.getUserConfigs();
  const preferredDateFormat2 = userConfigs.preferredDateFormat;
  const getOrdinalNum = (n: number) => {
    return (
      n +
      (n > 0
        ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10]
        : '')
    );
  };
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
  const getDateForPage = (d: Date, preferredDateFormat: string) => {
    const getYear = d.getFullYear();
    const getMonth = d.toString().substring(4, 7);
    const getMonthNumber = d.getMonth() + 1;
    const getDate = d.getDate();
  
    if (preferredDateFormat === 'MMM do yyyy') {
      return `[[${getMonth} ${getOrdinalNum(getDate)}, ${getYear}]]`;
    } else if (
      preferredDateFormat.includes('yyyy') &&
      preferredDateFormat.includes('MM') &&
      preferredDateFormat.includes('dd') &&
      ('-' || '_' || '/')
    ) {
      var mapObj = {
        yyyy: getYear,
        dd: ('0' + getDate).slice(-2),
        MM: ('0' + getMonthNumber).slice(-2),
      };
      let dateStr = preferredDateFormat;
      dateStr = dateStr.replace(/yyyy|dd|MM/gi, function (matched) {
        return mapObj[matched];
      });
      return `[[${dateStr}]]`;
    } else {
      return `[[${getMonth} ${getOrdinalNum(getDate)}, ${getYear}]]`;
    }
  };
  async function parseDynamically(blockContent){
    let ifParsing = /(i+f)/
    if(blockContent.match(ifParsing)){
    let parsedInput = blockContent.slice(2, -2); 
    let spaceParsedInput = parsedInput.replace(/\s+/g, '');
    let input2 = spaceParsedInput.split("if")
    let input3 = input2[1].split("=")
    return parseConditional(input3[0], input3[1])
    }
  // Implement time parsing
  if (blockContent.toLowerCase() == "<%currentTime%>" || blockContent.toLowerCase() =="<%time%>" || blockContent.toLowerCase() == "<%current time%>"){
        let currentTime = new Date()
        let formattedTime = currentTime.getHours() + ":" + currentTime.getMinutes()
        return(formattedTime)
  }
  // Implement if parsing
  const parsedBlock = await Sherlock.parse(blockContent);
  // Destructure
  const { isAllDay, eventTitle, startDate, endDate } = parsedBlock;
  if (startDate == null){
    return blockContent
  }
  return(getDateForPage(startDate, preferredDateFormat2))

  }
    logseq.provideModel({
        async insertTemplatedBlock (e: any) {
            const { blockUuid, template } = e.dataset
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
                    // console.log(missingKeys[key]["length"])
                      // console.log(key)
                    switch (missingKeys[key]["length"]){
                      case 3: 
                      // console.log("3")
                      var constant2 = missingKeys[key][0]
                      var constant3 = missingKeys[key][1]
                      var constant4 = missingKeys[key][2]
                      childBlocksArr[constant2]["children"][constant3]["children"].splice(constant4,1)
                      break;
                      case 2: 
                      // console.log("2")
                      var constant2 = missingKeys[key][0]
                      var constant3 = missingKeys[key][1]
                      childBlocksArr[constant2]["children"].splice(constant3,1)    
                      break;
                      case 1: 
                      // console.log("1")
                      var constant2 = missingKeys[key][0]
                      childBlocksArr[constant2] = null
                      break;
                      case 0: 
                      break;
                      default:
                      console.log(`error: keylength is ${missingKeys[key]["length"]}`);
                    }
                  }
                  // childBlocksArr[0]["children"][0]["children"].splice(1,1)
                  // childBlocksArr[0]["children"][2]["children"].splice(2,1)
                  // childBlocksArr[0]["children"].splice(2,1)    
                  // childBlocksArr[0] = null
                      
                      
                      


                      await logseq.Editor.insertBatchBlock(blockUuid, childBlocksArr, {
                        before: false,
                        sibling: false,
                      });
                  }

            }
          } catch (err) {
              console.log(err)
            }

          },
    }),
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

    let templaterBlock;

    logseq.Editor.registerSlashCommand('Create Templater Block', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :templater, , }} `);
        templaterBlock = await logseq.Editor.getCurrentBlock();
      });
      
      logseq.Editor.registerSlashCommand('Create Templater Block (guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :templater, template name, button title}} `);
        templaterBlock = await logseq.Editor.getCurrentBlock();
      });

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title] = payload.arguments;
        if (title == undefined){
          title = "New Template"
        }

// logseq.Editor.removeBlock
        
        if (type ==':templater'){
        logseq.provideUI({
            key: 'logseq templater plugin',
            reset: true,
            slot,
            template: `
            <button class="templater-btn" data-block-uuid="${payload.uuid}" data-template="${template}" data-title="${title}"
            data-on-click="insertTemplatedBlock">${title}</button>
           `,
          });
        }
      });
}

logseq.ready(main).catch(console.error)