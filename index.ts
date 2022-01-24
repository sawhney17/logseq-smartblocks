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
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');
  function timeConverter(x){
    var a = new Date(x * 1000);
    // var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    // var month = months[a.getMonth()];
    var month = a.getMonth()+1
    var date = a.getDate();
    var time = year + month + date;
    console.log(time)
    return time;
  }
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
        else{
            return "Error"
        }
        break;
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
        break;
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
          async insertFormattedBlock (e: any) {
            const { blockUuid, propertyName, title, displayer, range} = e.dataset
            var query = `
            [:find (pull ?b [*])
            :where
            [?b :block/properties ?p]
            [(get ?p :${propertyName})]]
     `
     console.log(range)
 
            try {
                let ret = await logseq.DB.datascriptQuery(query)
                const result0 = ret?.flat()
                logseq.Editor.insertBlock(blockUuid, title, {sibling:false})
                
                logseq.Editor.insertBlock(blockUuid, "Date", {sibling:false})
                logseq.Editor.insertBlock(blockUuid, propertyName, {sibling:false})

                let parentBlock = await logseq.Editor.getBlock(blockUuid, {includeChildren:true})
                if (parentBlock?.children) { //Checking to make sure blocks were successfully created
                //defining constants
                let headerBlock = parentBlock.children[0]
                let x_value_block = parentBlock.children[1]
                let y_value_block = parentBlock.children[2]
                let header_uuid = headerBlock["uuid"]
                let x_uuid = x_value_block["uuid"]
                let y_uuid = y_value_block["uuid"]
                //defining time filters    
                let date = Math.round((new Date()). getTime() / 1000);
                let adjustedDate = date - range*86400  
                let cutoff = timeConverter(adjustedDate)

                if(result0 && result0.length > 0) { //Ensuring that the results of the datascript query isn't empty
                    var results = []
                    for (const constant in result0) {
                        try {
                            if ([result0[constant]][0]["journal?"]){
                                if (![result0[constant]][0]["page"]!= undefined){
                                  if([result0[constant]][0]["journal-day"] > cutoff){
                                    console.log("success")
                                    results.push([result0[constant]][0])
                                  }
                                }
                            }
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                    results.sort((a, b) => {
                        return [a][0]["journal-day"] - [b][0]["journal-day"];
                    });
                    for (const constant in results) {

                        if ([results[constant]][0]["original-name"] !== undefined){
                        logseq.Editor.insertBlock(x_uuid,[results[constant]][0]["original-name"], {sibling:false});
                        logseq.Editor.insertBlock(y_uuid,String([results[constant]][0]["properties"][propertyName]),{sibling: false});
                        }
                    }

                  }
                  console.log("Hello")
                  logseq.Editor.updateBlock(blockUuid, `{{renderer :${displayer}s_${uniqueIdentifier()}}}`);
                  logseq.Editor.moveBlock(y_uuid, header_uuid,{children:true});
                  logseq.Editor.moveBlock(x_uuid, header_uuid,{children:true});
                }
                  
                }
             catch (err) {
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
      
      logseq.Editor.registerSlashCommand('Property Visualizer', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :property_visualizer, }}`);
      });
      logseq.Editor.registerSlashCommand('Create Templater Block (guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :templater, template name, button title}} `);
        templaterBlock = await logseq.Editor.getCurrentBlock();
      });
      
      logseq.Editor.registerSlashCommand('Property Visualizer (guided)', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :property_visualizer, property name, chart/table styling(eg. data nosum, area white 500), chart/table, date range}}`);
      });

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title, displayStyle, dateRange] = payload.arguments;
        if (title == undefined && type==":templater"){
          title = "New Template"
        }
        if (title == undefined && type==":property_visualizer"){
          title = "data"
        }

        if (displayStyle == undefined && type==":property_visualizer"){
          displayStyle = "table"
        }
        if (dateRange == undefined && type==":property_visualizer"){
          dateRange = "10000"
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

          if (type == ':property_visualizer'){
          logseq.provideUI({
              key: 'logseq visualizer plugin',
              reset: true,
              slot,
              template: `
              <button class="templater-btn" data-block-uuid="${payload.uuid}" data-property-name="${template}" data-title="${title}" data-displayer="${displayStyle}" data-range="${dateRange}"
              data-on-click="insertFormattedBlock">Visualize ${template} as ${displayStyle}</button>
             `,
            });
          }
          else return;
      });
}

logseq.ready(main).catch(console.error)