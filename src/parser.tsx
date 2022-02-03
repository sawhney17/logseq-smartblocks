import { getDateForPage} from 'logseq-dateutils';
import Sherlock from 'sherlockjs'
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
          return "Success"
      }
      else if (new Date().getDay() == 0 && value == 7){
          return "Success"
      }
      else{
          return "Error"
      }
      case "dayofmonth":
      if(new Date().getDate() == value){
          return "Success"
      }
      else{
          return "Error"
      }
      case "month":
      if(new Date().getMonth() == value){
          return "Success"
      }
      else{
          return "Error"
      }
      case "dayofyear":
      if(new Date().getDate() == value){
          return "Success"
      }
      else{
          return "Error"
      }
      default:
      return "Error"
  }
}
export async function parseDynamically(blockContent){
    const userConfigs = await logseq.App.getUserConfigs();
    const preferredDateFormat = userConfigs.preferredDateFormat;
    let ifParsing = /(i+f)/
    let pageBlock = /currentpage/
    let randomParsing = /randomblock/
    let parsedInput = blockContent.slice(2, -2); 
    if(blockContent.match(ifParsing)){
      let input = parsedInput.split(":")
      let spaceParsedInput = input[0].replace(/\s+/g, '');
      let input1 = spaceParsedInput.split("||")
      let tempStorageArray = []
      for (const x in input1){
      let input2 = input1[x].split("if")
      let input3 = input2[1].split("=")
          tempStorageArray.push(parseConditional(input3[0], input3[1]))
      }
      if (tempStorageArray.includes("Success")){
          return(input[1])
      }
      else{
          return("")
      }
      }
    if(blockContent.toLowerCase().match(pageBlock)){
      let currentp3age = await logseq.Editor.getCurrentPage()
      return currentp3age.name
    }
    if(blockContent.match(randomParsing)){
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

function parseDates(){
  
}