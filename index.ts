import '@logseq/libs'
import {
  BlockEntity,
  PageEntity,
  IBatchBlock,
} from '@logseq/libs/dist/LSPlugin.user';
/**
* main entry
*/



async function main () {
  const uniqueIdentifier = () =>
    Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '');
    logseq.provideModel({
        async insertTemplatedBlock (e: any) {
            const { blockUuid, template } = e.dataset
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
                const index = Math.floor(Math.random() * results.length)
                refUUID = results[0].uuid.$uuid$
                const origBlock = await logseq.Editor.getBlock(refUUID, {
                  includeChildren: true,
                });
                console.log(origBlock)
                if (origBlock.children.length === 0 || !origBlock.children) {
                      logseq.App.showMsg("Whoops! Doesn't look like there's any content under the template.");
                    } else {
                      const childBlocksArr: IBatchBlock = origBlock.children;
                  
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
     console.log(propertyName)
     console.log(range)
            try {
                let ret = await logseq.DB.datascriptQuery(query)
                // ret.result-trn
                const result0 = ret?.flat()
                logseq.Editor.insertBlock(blockUuid, title, {sibling:false})
                
                logseq.Editor.insertBlock(blockUuid, "Date", {sibling:false})
                logseq.Editor.insertBlock(blockUuid, propertyName, {sibling:false})

                let parentBlock = await logseq.Editor.getBlock(blockUuid, {includeChildren:true})
                console.log(parentBlock)
                if (parentBlock?.children) { //Checking to make sure blocks were successfully created
                //defining constants
                let headerBlock = parentBlock.children[0]
                let x_value_block = parentBlock.children[1]
                let y_value_block = parentBlock.children[2]
                let header_uuid = headerBlock.uuid
                let x_uuid = x_value_block.uuid
                let y_uuid = y_value_block.uuid


                if(result0 && result0.length > 0) { //Ensuring that the results of the datascript query isn't empty
                    var results = []
                    for (const constant in result0) {
                        try {
                            if ([result0[constant]][0]["journal?"]){
                                if (![result0[constant]][0]["page"]!= undefined){
                                    results.push([result0[constant]][0])
                                }
                            }
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                    console.log([results][0][0])
                    results.sort((a, b) => {
                        return [a][0]["journal-day"] - [b][0]["journal-day"];
                    });
                    for (const constant in results) {
                    // try {if ([results[constant]][0]["journal?"]){
                    // if (![results[constant]][0]["pre-block?"]){

                        if ([results[constant]][0]["original-name"] !== undefined){
                        logseq.Editor.insertBlock(x_uuid,[results[constant]][0]["original-name"], {sibling:false});
                        logseq.Editor.insertBlock(y_uuid,String([results[constant]][0]["properties"][propertyName]),{sibling: false});
                            // console.log([results[constant]][0]["properties"][propertyName])
                            // console.log([results[constant]][0]["page"])
                        }
                    }

                    // }
                // }
                    // catch(err){
                    //     console.log(err)
                    // }
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
      
      logseq.Editor.registerSlashCommand('property visualizer', async () => {
        await logseq.Editor.insertAtEditingCursor(`{{renderer :property_visualizer, , , , }}`);
      });

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title, displayStyle, dateRange] = payload.arguments;
        if (title == undefined){
          title = "New Template"
        }
        
        if (type ==':templater'){
        logseq.provideUI({
            key: 'logseq wordcount plugin',
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
              data-on-click="insertFormattedBlock">Format Property to Table</button>
             `,
            });
          }
          else return;
      });
}

logseq.ready(main).catch(console.error)
