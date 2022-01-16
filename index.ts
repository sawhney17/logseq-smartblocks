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

      logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
        var [type, template, title] = payload.arguments;
        const UUID = payload.uuid
        if (title == undefined){
          title = "New Template"
        }

        const id = type.split('_')[1]?.trim();
        const templateID = `template_${id}`;
        
        if (type !== ':templater') return;
        logseq.provideUI({
            key: 'logseq wordcount plugin',
            reset: true,
            slot,
            template: `
            <button class="templater-btn" data-block-uuid="${payload.uuid}" data-template="${template}" data-title="${title}"
            data-on-click="insertTemplatedBlock">${title}</button>
           `,
          });
      });
}

logseq.ready(main).catch(console.error)
